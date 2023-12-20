const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/cloudinary");

const createCourse = async function (req, res, next) {
  try {
    //fetch data
    const {
      courseName,
      courseDescription,
      courseObjective,
      courseLanguage,
      price,
      tag,
      category,
    } = req.body;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !courseObjective ||
      !price ||
      !tag ||
      !courseLanguage ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const picPath = req.file.path;
    // if (!status || status === undefined) {
    //   status = "Draft";
    // }

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

    // Check if the tag given is valid
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      });
    }

    // upload to cloudinary
    const uploadResponse = await uploadImageToCloudinary(picPath);
    console.log("Upload ", uploadResponse);
    if (!uploadResponse) {
      return res.status(403).json({
        success: false,
        message: "Invalid credetials",
      });
    }

    // create an entry for new Course
    const newCourse = new Course({
      courseName,
      courseDescription,
      courseObjective,
      courseInstructor: userId, // !
      courseLanguage,
      price,
      courseThumbnail: uploadResponse.secure_url,
      tag: tag,
      category: categoryDetails._id, // ya to req.body.tag ya phir  categoryDetails._id use karlo no problem
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
    await Category.findByIdAndUpdate(
      { _id: category },
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

const getAllCourse = async function (req, res, next) {
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
      } // ! test this extremely in postman
    )
      .populate("courseInstructor", "firstName lastName _id ")
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

const getCourseDetails = async function (req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        status: false,
        message: "Course Id required",
      });
    }

    const courseDetails = await Course.findById({ _id: courseId })
      .populate("courseInstructor", "_id firstName lastName ")
      .populate(
        "courseContent")
        // populate: {
        //   path: "subSection",
        // },
      // })
      // .populate("ratingAndReview")
      // .populate("category")
      // .populate("studentsEnrolled")
      .exec(); // ! update it and make it efficient

    if (!courseDetails) {
      return res.status(400).json({
        status: false,
        message: "Could not find the course",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.log("Error while getting course details", error);
    return res.status(500).json({
      success: false,
      message: "Could not get Course Detail",
    });
  }
};

module.exports = { createCourse, getAllCourse, getCourseDetails };
