const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    requried: true,
    trim: true,
  },
  courseDescription: {
    type: String,
    requried: true,
    trim: true,
  },
  courseObjective: {
    type: String,
    requried: true,
    trim: true,
  },
  courseInstructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  courseLanguage: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  courseThumbnail: {
    type: String,
    required: true,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // requried: true, // ! Check
    },
  ],
});

module.exports = mongoose.model("CourseSchema", courseSchema);
