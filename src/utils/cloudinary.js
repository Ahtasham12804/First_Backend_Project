import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
 
const uploadCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) {
            return null;
        }

        console.log("Uploading file:", localFilePath);
 
        // uplode file 
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        );

        console.log("Cloudinary upload successful:");
        console.log(response.url);
        
        // Delete temporary local file after successful upload
        fs.unlinkSync(localFilePath)
        return response;
      
    } catch (error) {

        console.log("Cloudinary upload failed:");
        console.log(error);

        // Delete temporary file only if it exists
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadCloudinary };
 