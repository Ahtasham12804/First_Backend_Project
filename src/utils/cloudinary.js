// cloudinary is a cloud-based service that provides an end-to-end image and video management solution, including uploads, storage, manipulations, optimizations, and delivery. It allows developers to easily integrate media management capabilities into their applications.

import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs'; // fs is a built-in Node.js module that helps in interacting with the file system. It provides methods to read, write, and manipulate files and directories.



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});





const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // Upload the file to Cloudinary using the uploader 

        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'});

        // file has been uploaded to cloudinary

        console.log('File uploaded to Cloudinary:', response.url);

        return response; // Return the response object containing details about the uploaded file
    }

    catch (error) {
        fs.unlinkSync(localFilePath); // removen the locally saved temp file as the upload operation failed
        return null ;
   
    }
 }
    
export { uploadCloudinary };
