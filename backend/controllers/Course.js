const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadCloudinary");

const createCourse = async function (req, res, next) {
  try {
    //fetch data
    const {
      courseName,
      courseDescription,
      courseObjective,
      price,
      tag,
      courseLanguage,
    } = req.body;
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !courseObjective ||
      !price ||
      !tag ||
      !thumbnail ||
      !courseLanguage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check for instructor details
    const userId = req.user._id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details ", instructorDetails); // ! check faltu to nhi hai

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    let tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(401).json({
        success: false,
        message: "Tag doesn't exists",
      });
    }

    // upload to cloudinary
    const thumbnailImage = await uploadToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create an entry for new Course
    const newCourse = new Course({
      courseName,
      courseDescription,
      courseObjective,
      courseInstructor: userId, // !
      courseLanguage,
      price,
      courseThumbnail: thumbnailImage.secure_url,
      tag, // ya to req.body.tag ya phir tagDetails._id use karlo no problem
    });

    const createNewCourse = await newCourse.save();

    //add new course to  courselist of user (instructor hai)
    const addUserCourse = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          courses: createNewCourse._id,
        },
      },
      { new: true }
    );

    console.log(addUserCourse);

    // ! update tag shechma
    await Tag.findByIdAndUpdate(
      { _id: tag },
      {
        $push: {
          courses: createNewCourse._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: createNewCourse,
    });
  } catch (error) {
    console.log("Error whlile creating course", error);
    return res.status(500).json({
      success: false,
      message: "Course creation failed",
    });
  }
};

const showAllCourses = async function (req, res, next) {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        courseThumbnail: true,
        courseInstructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
        tag: true,
      } // ! test this extremely in postman
    )
      .populate("courseInstructor", "firstName lastName _id ")
      .populate("tag", "name _id")
      .exec();

    console.log(allCourses);

    return res.status(200).json({
      success: true,
      message: "All courses successfully fetched",
      data: allCourses,
    });
  } catch (error) {
    console.log("Error in show all courses", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch all courses",
    });
  }
};

module.exports = { createCourse, showAllCourses };
