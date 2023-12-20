const express = require("express");
const router = express.Router();


const {
  deleteAccount,
  getEnrolledCourses,
  getUserFullDetails,
  updateProfile,
  uploadProfilePic,
} = require("../controllers/Profile");
const { isAuth } = require("../middlewares/auth"); // middlewares
const { imageUpload } = require("../middlewares/multer");
router
  .put("/updateProfile", isAuth, updateProfile) //
  .put("/uploadProfilePic", isAuth, imageUpload.single("profilepic"), uploadProfilePic)
  .get("/getEnrolledCourses", isAuth, getEnrolledCourses)
  .get("/getUserFullDetails", isAuth, getUserFullDetails) //
  .delete("/deleteAccount", isAuth, deleteAccount); //

// make one more profile to view user's page whether Student or Instructor
module.exports = router;
