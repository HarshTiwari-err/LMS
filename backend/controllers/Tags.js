const Tag = require("../models/Tag");

// ! TODO: Replace tag with category

const createTag = async function (req, res, next) {
  try {
    const { tag, desc } = req.body;

    if (!tag || !desc) {
      return res.status(400).json({
        success: false,
        message: "Tag fields required",
      });
    }

    // Check if the tag already exists
    let tagExists = await Tag.findOne({ name: tagName });
    if (tagExists) {
      return res.status(401).json({
        success: false,
        message: "Same tag already exists",
      });
    }

    let newTag = new Tag({
      name: tagName,
      description: desc,
    });
    const createdTag = await newTag.save();
    console.log(createdTag); // remove this later on
    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Tag creation failed",
      error,
    });
  }
};

const showAllTags = async function (req, res, next) {
  try {
    const allTags = await Tag.find({}, { name: true, description: true }); // response mei yhi dono chaiye relation to course nhi chahiye
    return res.status(200).json({
      success: true,
      message: "All tags returned succssfully",
      allTags,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Fail in fetching all tags",
      error,
    });
  }
};

module.exports = { createTag, showAllTags };
