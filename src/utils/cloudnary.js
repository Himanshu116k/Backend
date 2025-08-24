import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Configuration
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET  
  // cloud_name:'dfeglszzx',
  // api_key: '729343568924984',
  // api_secret:'zflOQThAgzg7qA45IXGyRhwARsM', 
});


const uplodOnCloudnary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const fixedPath = localFilePath.replace(/\\/g, "/");
    console.log("Uploading File to Cloudinary:", path.resolve(localFilePath));

    const response = await cloudinary.uploader.upload(fixedPath, {
      resource_type: "auto",
    });

    console.log("Upload Successful:", response.url);
    fs.unlinkSync(localFilePath);
    console.log(response)
    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

export {uplodOnCloudnary}
