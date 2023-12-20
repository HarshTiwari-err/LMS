const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

const createRating = async function (req, res, next) {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user._id;
    // validation
    if (!courseId || !userId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //check if user is enrolled or not but you can make it like that user can't review unless he is enrolled
    const enrolledCheck = await Course.findById({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { _id: userId } },
    });
    if (!enrolledCheck) {
      {
        console.log("User is not enrolled in Course");
        return res.status(400).json({
          success: false,
          message: "You aren't authorised to reveiw the coures",
        });
      }
    }
    // Check if the userId already rated the course
    const isRatedByUser = await Course.findById({ _id: courseId })
      .populate({
        path: "ratingAndReview",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .exec(); // or you can update the RatingAndReview schema and add Course ref to it also make it easily accessible

    if (
      isRatedByUser &&
      isRatedByUser.ratingAndReview.some(
        (review) => review.user._id.toString === userId
      )
    ) {
      console.log(
        "User has already submitted a rating and review for the course"
      );
      return res.status(400).json({
        success: false,
        message: "You have already rated this course",
      });
    }

    // store the rating and review in db
    const makeRating = new RatingAndReview({
      user: userId,
      rating,
      review,
    });
    const saveRating = await makeRating.save();

    // push into Course ratingAndReview
    const pushIntoCourse = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: saveRating._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "You successfully rated the course",
      pushIntoCourse, // !
    });
  } catch (error) {
    console.log("Error in rating the courses", error);
    return res.status(500).json({
      success: false,
      message: "Could not rate the courses",
    });
  }
};

// ! Important concept   // think to improve this
const getAvgRating = async function (req, res, next) {
  try {
    const { courseId } = req.body;
    // validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Courseid is required",
      });
    }

    // get the rating by courseId in ratingReveiw schema
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null, // ! it means not decided
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched",
        avgRating: result[0].averageRating, // 0th index pe store hua hoga
      });
    }
    // if no rating
    return res.status(200).json({
      success: true,
      message: "No rating",
      averageRating: 0,
    });
  } catch (error) {
    console.log("Could not fetch avg rating");
    return res.status(500).json({
      success: false,
      message: "Could not fetch average rating",
    });
  }
};

// you can get all rating on all the courses for the home page for trust
const getAllRating = async function (req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "CourseId is required",
      });
    }

    const allRating = await RatingAndReview.find({ course: courseId }).populate(
      "user",
      "firstName _id"
    ); // extract name and it's Id for visiting the user

    if (!allRating) {
      return res.status(400).json({
        success: false,
        message: "Could not find rating for the course",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All ratings",
      data: allRating,
    });
  } catch (error) {
    console.log("Error in fetching all rating of the course", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch all the rating of course",
    });
  }
};

module.exports = { createRating, getAvgRating, getAllRating };
