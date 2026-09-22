import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/API_Error.js";
import{ User } from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/API_Response.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefressToken = async(userID) =>{

    try {
      const user = await User.findById(userID)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}

    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    } 
}


const registerUser = asyncHandler( async (req, res) => {

    
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname, email, username, password } = req.body


    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }


    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;

     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }



    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    
    
    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler( async (req, res) => {

    //req.body me email or password le aao
    // usernam or mail
    // find the user 
    // check the password
    //tokens 
    // send cookies 


const {email, username, password} = req.body

if(!(username || email)){
    throw new ApiError(400, "Username or email is required")
}
  

const user = await User.findOne({
    $or: [{username}, {email}]
})

if(!user){
    throw new ApiError(404, "User not found")
}
 

const isPasswordCorrect = await user.isPasswordCorrect(password)

if(!isPasswordCorrect){
    throw new ApiError(401, "Invalid password")
}


// generate access and refresh token
const {accessToken, refreshToken} = await generateAccessAndRefressToken(user._id)



// login 

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


// cookie 
const options = {  // http and secure ko true krne ke baad cookie ko sirf server se change kiya ja sakta h 
    httpOnly: true,
    secure: true
}

return res
.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )






})


const logOutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,{
        $set: {refreshToken: undefined}
    },
    {new: true}
)

const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200,{},"User logged out successfully" ))


})



const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required")
    }

try {
    
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Refresh token is expired or invalid")
    }


    const option ={
        httpOnly: true,
        secure: true    
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefressToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", newRefreshToken, option)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed successfully"
        )
    )
}
catch (error)
 {
    throw new ApiError(401, error?.message || "Invalid refresh token")
 }


})



 export { registerUser , loginUser , logOutUser , refreshAccessToken}