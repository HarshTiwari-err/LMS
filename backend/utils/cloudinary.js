const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadImageToCloudinary = async (localFilePath) => {
  try {
    console.log("In controller",localFilePath);
    
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: process.env.FOLDER_NAME,
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

module.exports = { uploadImageToCloudinary };
