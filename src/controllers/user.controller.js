import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import{ User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/API_Response.js";

// POSTMAN CONFIGURATION
// const registerUser = asyncHandler(async (req, res) => {
//     // Your registration logic here
//     res.status(200).json({ 
//     message: "User registered successfully" })
// })




const registerUser = asyncHandler(async (req, res) => {
     // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName , email, password, username} = req.body
    console.log("email", email);

   
   // insted of checking each field separately, we can use an array and check if any field is empty or undefined
    if (
      [fullName, email, password, username].some((field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    
   const existedUser = User.findOne({
      $or: [{ email }, { username }], 
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if( !avatarLocalPath ){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
      throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username : username.toLowerCase()
    })
   
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }

      res.status(201).json(
         new ApiResponse(200, createdUser, "User registered successfully")
      )



   })

 export { registerUser }