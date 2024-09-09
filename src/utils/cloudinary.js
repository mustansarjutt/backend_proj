import { v2 as cloudinary } from "cloudinary";
import exp from "constants";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // if uploaded successfully
        console.log("uploaded successfully ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove locally saved temp file when upload fail
        return null;
    }
}

export { uploadOnCloudinary }