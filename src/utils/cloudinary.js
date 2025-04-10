import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

const uploadOneCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        //file has been uploaded successfully
        console.log("File uploaded successfully:", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the file from the local storage
        return null;
    }
};


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export default uploadOneCloudinary;