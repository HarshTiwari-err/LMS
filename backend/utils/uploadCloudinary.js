const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async function (file, folder, height, quality) {
  try {
    const options = { folder };
    if (height) {
      options.height = height;
    }
    if (quality) {
      options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cloudinary Upload failed",
    });
  }
};

module.exports = uploadToCloudinary;
