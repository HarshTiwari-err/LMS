const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  // Destination to store image
  destination: "./public/temp",
  filename: (req, file, cb) => {
    console.log("file ", file);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + Date.now() + fileExtension);
    // file.fieldname is the name of the field (image)
    // path.extname gets the uploaded file extension
  },
});

const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20*1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    console.log("fule", file);
    const allowedExtensions = /\.(png|jpg|jpeg|mp4)$/; // Allow only png and jpg formats
    if (
      !allowedExtensions.test(path.extname(file.originalname).toLowerCase())
    ) {
      return cb(
        new Error("Please upload an image with a valid extension (png, jpg)")
      );
    }
    cb(null, true);
  },
});

const videoUpload = multer({
  storage,
  fileFilter(req, file, cb) {
    console.log("fule", file);
    const allowedExtensions = /\.(png|jpg|jpeg|mp4|mov)$/; // Allow only png and jpg formats
    if (
      !allowedExtensions.test(path.extname(file.originalname).toLowerCase())
    ) {
      return cb(
        new Error("Please upload an image with a valid extension (mp4,mov,mkv)")
      );
    }
    cb(null, true);
  },
})
module.exports = { imageUpload ,videoUpload};
