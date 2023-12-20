const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/cloudinary");
const updateProfile = async function (req, res, next) {
  try {
    const { displayName, profession, dateOfBirth, gender, about, contact } =
      req.body;

    const userId = req.user._id;
    const updateFields = {
      displayName,
      profession,
      dateOfBirth,
      gender,
      about,
      contact,
    };
    console.log(updateFields);
    const userDetails = await User.findById({ _id: userId });
    const profileId = userDetails.additionalDetails;
    const updateProfileDetails = await Profile.findByIdAndUpdate(
      { _id: profileId },
      updateFields,
      { new: true }
    );
    console.log("Updated profile", updateProfileDetails);
    return res.status(200).json({
      success: true,
      message: "Successfully updated profile",
      data: updateProfileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

const uploadProfilePic = async function (req, res, next) {
  try {
    console.log("Req", req.file);

    const picPath = req.file.path;
    const userId = req.user._id;
    console.log("Is it working or not ", picPath);
    const uploadResponse = await uploadImageToCloudinary(picPath);
    if (!uploadResponse) {
      return res.status(403).json({
        success: false,
        message: "Invalid credetials",
      });
    }
    // // update the img in user
    console.log("Response ", uploadResponse);
    // const updatedProfile = await User.findByIdAndUpdate(
    //   { _id: userId },
    //   { image: uploadres.secure_url },
    //   { new: true }
    //   );

    return res.status(200).json({
      success: true,
      message: "Successfully updated profile pic",
      // data: updatedProfile.image,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAccount = async function (req, res, next) {
  try {
    const userId = req.user._id;
    console.log("User Id", userId);
    // delete
    const deleteAcc = await User.findByIdAndDelete({ _id: userId });
    // think should we set cookie to null because user should be logged out now
    console.log("acc deleted");
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

const getEnrolledCourses = async function (req, res, next) {
  try {
    const userId = req.user._id;
    const enrolledCourses = await User.findById({ _id: userId });
    if (!enrolledCourses) {
      return res.status(401).json({
        success: false,
        message: "Could not get enrolled courses",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully",
      data: enrolledCourses.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserFullDetails = async function (req, res, next) {
  try {
    const userId = req.user._id;
    console.log("user id", userId);
    const userDetails = await User.findById({ _id: userId }).populate(
      "additionalDetails"
    );
    console.log(userDetails);

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Could not get enrolled courses",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  updateProfile,
  uploadProfilePic,
  deleteAccount,
  getEnrolledCourses,
  getUserFullDetails,
};
