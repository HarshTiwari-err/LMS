const Category = require("../models/Category");
const mongoose = require("mongoose");
// ! TODO: Replace tag with category

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // Check if the tag already exists
    let categoryExists = await Category.findOne({ name: name });
    if (categoryExists) {
      return res.status(401).json({
        success: false,
        message: "Same tag already exists",
      });
    }

    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategorysDetails);
    return res.status(200).json({
      success: true,
      message: "Categorys Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

const showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
    console.log(allCategorys);
    if (allCategorys.length === 0) {
      throw Error("No category");
    }
    res.status(200).json({
      success: true,
      data: allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCourseByCategory = async (req, res) => {
  try {
    const { category } = req.body;
    //validation
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "category is required",
      });
    }

    try {
      const objectCategory = new mongoose.Types.ObjectId(category);
      const getCategoryCourse = await Category.findById({
        _id: objectCategory,
      }).populate("courses");
      // .exec();
      console.log(getCategoryCourse);
      if (getCategoryCourse.courses.length === 0) {
        throw Error("Course by particular category not present");
      }
      return res.status(200).json({
        success: true,
        message: "Course for category",
        data: {
          getCategoryCourse,
          // inset more course
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "No course for the given category",
      });
    }

    // !get different category course $ne
    // !get top selling course
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createCategory, showAllCategories, getCourseByCategory };
