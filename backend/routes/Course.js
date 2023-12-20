const express = require("express");
const router = express.Router();

const {
  createRating,
  getAllRating,
  getAvgRating,
} = require("../controllers/RatingAndReview");

const {
  createCategory,
  getCourseByCategory,
  showAllCategories,
} = require("../controllers/Category");

const {
  createCourse,
  getAllCourse,
  getCourseDetails,
} = require("../controllers/Course");
const {
  createSection,
  deleteSection,
  updateSection,
} = require("../controllers/Section");
const {
  createSubSection,
  deleteSubSection,
  updateSubSection,
} = require("../controllers/SubSection");
const {
  isAuth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/auth"); // middlewares
const { imageUpload,videoUpload } = require("../middlewares/multer");
// Instructor requests
router
  .post(
    "/createCourse",
    isAuth,
    isInstructor,
    imageUpload.single("thumbnail"),
    createCourse
  )
  .post("/createSection", isAuth, isInstructor, createSection)
  .post("/updateSection", isAuth, isInstructor, updateSection)
  .post("/deleteSection", isAuth, isInstructor, deleteSection)
  .post("/createSubSection", isAuth, isInstructor,imageUpload.single("videofile"), createSubSection)
  .post("/updateSubSection", isAuth, isInstructor, updateSubSection)
  .post("/deleteSubSection", isAuth, isInstructor, deleteSubSection)
  .get("/getAllCourses", getAllCourse)
  .post("/getCourseDetails", getCourseDetails); // ! think what are we sending make sure the enrolled std get's the course content

// Category
router
  .post("/createCategory", isAuth, isAdmin, createCategory)
  .post("/getCourseByCategory", getCourseByCategory)
  .get("/showAllCategories", showAllCategories);

// Ration and Review
router
  .post("/createRating", isAuth, createRating)
  .get("/getAverageRating", getAvgRating)
  .get("/getAllRating", getAllRating);

module.exports = router;
