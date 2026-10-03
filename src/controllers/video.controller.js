import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {ApiError} from "../utils/API_Error.js";
import { ApiResponse } from "../utils/API_Response.js";
import { Comment } from "../models/comment.model.js";   
import {Like} from "../models/like.model.js";
import {Playlist} from "../models/playlist.model.js";
import {deleteFromCloudinary} from "../utils/cloudinary.js";


const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description} = req.body

    const videoFileLocalPath= req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError ("400" , "videoFile or thumnail not find")
    }
    
        const videoFile = await uploadCloudinary(videoFileLocalPath)
        const thumbnail = await uploadCloudinary(thumbnailLocalPath)

        if(!videoFile){
            throw new ApiError(400, "videofile is required")
        }

        if(!thumbnail){
            throw new ApiError(400, "thumbnail is required")
        }


        const video = await Video.create({
            videoFile:videoFile.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            views:0,
            isPublished:true,
            owner:req.user._id
        })

        if (!video) {
            throw new ApiError(500, "Something went wrong while publishing video");
        }

        const uploadedvideo=await Video.findById(video._id)
        if(!uploadedvideo){
            throw new ApiError(400, "something went wrong during uploading a video")
        }

        return res.
        status(200)
        .json(new ApiResponse(200, uploadedvideo, "Video published Successfully."))
})



const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // 1. Validate ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    // 2. Fetch video 
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [currentUserId, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        // Add computed fields
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [currentUserId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);
    // 3. Check if video exists
    if (!video?.length) {
        throw new ApiError(404, "Video not found");
    }
    const videoData = video[0];
    // 4. Access check: unpublished videos should only be visible to their owner
    if (!videoData.isPublished && (!req.user || !videoData.owner?._id.equals(req.user._id))) {
        throw new ApiError(403, "This video is private or unpublished");
    }
    // 5. Concurrently increment view count & push to watchHistory
    await Promise.all([
        Video.findByIdAndUpdate(videoId, {
            $inc: { views: 1 }
        }),
        req.user?._id
            ? User.findByIdAndUpdate(req.user._id, {
                  $addToSet: {
                      watchHistory: videoId
                  }
              })
            : Promise.resolve()
    ]);
    // Reflect the incremented view count in response immediately
    videoData.views += 1;
    // 6. Return response
    return res
        .status(200)
        .json(new ApiResponse(200, videoData, "Video fetched successfully"));
});



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description} = req.body;
    const thumbnailLocalPath=req.files?.path;

    //1. Validate ObjectId
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    //2. check at least one field is provided for update
    if(!title?.trim() && !description?.trim() && !thumbnailLocalPath){
        throw new ApiError(400, "At least one field (title, description, thumbnail) is required for update")
    }

    //3. Find the video to check existence and ownership
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video")
    }

    //4. Prepare update object
    const updateFields = {};
    if(title?.trim()) {
        updateFields.title = title.trim();
    }
    if(description?.trim()) {
        updateFields.description = description.trim();
    }
    if(thumbnailLocalPath) {
        const thumbnail = await uploadCloudinary(thumbnailLocalPath);

        if(!thumbnail?.url){
            throw new ApiError(500, "Failed to upload thumbnail")
        }

        updateFields.thumbnail = thumbnail.url;
    }

    //5. Update the field in the database
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true }
    );

    if(!updatedVideo){
        throw new ApiError(500, "Failed to update video details")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"))
    
})



const extractPublicId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts.pop();
    const publicID = filename.split('.')[0];
    return publicID;
}; 
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Validate ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 2. Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 3. Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // 4. Delete assests from Cloudinary
    const videoPublicId = extractPublicId(video.videoFile);
    const thumbnailPublicId = extractPublicId(video.thumbnail);

    await Promise.all([
        videoPublicId ? deleteFromCloudinary(videoPublicId, "video") : Promise.resolve(),
        thumbnailPublicId ? deleteFromCloudinary(thumbnailPublicId, "image") : Promise.resolve()
    ]);


    // 5. Delete related records
    await Promise.all([
        Comment.deleteMany({ video: videoId }),
        Like.deleteMany({ video: videoId }),

        Playlist.updateMany(
            { videos: videoId },
            { $pull: { videos: videoId } }
        ),

        User.updateMany(
            { watchHistory: videoId },
            { $pull: { watchHistory: videoId } }
        )
    ]);

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));
});



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Validate ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 2. Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 3. Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status of this video");
    }

    // 4. Toggle publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to toggle publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Publish status toggled successfully"));
});

export {publishAVideo, getVideoById, updateVideo, deleteVideo}
