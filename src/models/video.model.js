 import mongoose, { Schema } from 'mongoose'; 
 import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 



 const videoSchema = new Schema(
    {

        videoFile: {
            type: String, // cloudinary url 
            required: true
        },

        thumbnail: {
            type: String, // cloudinary url 
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0 // views 0 se start honge jab video upload hoga
        },

        isPublished: {  // isPublished se hum ye check karenge ki video public hai ya nahi
            type: Boolean,
            default: true 
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // owner ka reference user model se hai 
        },


    }, {timestamps: true})




videoSchema.plugin(mongooseAggregatePaginate) // ye plugin humne video model me lagaya hai taki hum video ko paginate kar sake
 export const Video = mongoose.model('Video', videoSchema)