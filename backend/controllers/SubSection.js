const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/cloudinary");

const createSubSection = async function (req, res, next) {
  try {
    // fetch the required data
    console.log(req.body);
    const { sectionId, title, description, timeDuration } = req.body;
    // extract file/video
    // console.log(sectionId,title,description,timeDuration);
    const localVideoPath = req.file.path;
    // validate data
    if (!sectionId || !title || !description || !timeDuration) {
      return res.status(400).json({
        status: false,
        message: "All fields required",
      });
    }
    // upload to cloudinary and get response.url
    console.log("Upload");
    const uploadDetails = await uploadImageToCloudinary(localVideoPath);
    console.log(uploadDetails)
    if (!uploadDetails) {
      console.log("In if")
      return res.status(403).json({
        success: false,
        message: "Invalid credetials",
      });
    }
    console.log("Uploaded");
    // create a subsection
    const subSectionDetails = new SubSection({
      title,
      description,
      timeDuration,
      videoUrl: uploadDetails.secure_url,
    });
    const subSection = await subSectionDetails.save();
    // update section with Subsection _id
    const updateSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSection._id,
        },
      },
      { new: true }
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Sub Section created successfully",
    });
  } catch (error) {
    console.log("Error while creating subsection");
    return res.status(500).json({
      success: false,
      message: "Could not create SubSection",
    });
  }
};

const updateSubSection = async function (req, res, next) {
  try {
    const { title, subSectionId } = req.body;
    if (!title || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const updateSubSection = await SubSection.findByIdAndUpdate(
      { _id: subSectionId },
      {
        title,
      },
      { new: true }
    );
    console.log(updateSubSection);
    return res.status(200).json({
      success: true,
      message: "Successfully updated sub section",
      updateSubSection, // !
    });
  } catch (error) {
    console.log("Error while updating sub section");
    return res.status(500).json({
      success: false,
      message: "Could not update Sub Section",
    });
  }
};

const deleteSubSection = async function (req, res, next) {
  try {
    const { subSectionId, sectionId } = req.body;
    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const deleteSubSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    // ! delete subsection id from Section schema
    return res.status(200).json({
      success: true,
      message: "Sub-Section deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting subsection");
    return res.status(500).json({
      success: false,
      message: "Could not delete Sub Section",
    });
  }
};

module.exports = { createSubSection, updateSubSection, deleteSubSection };
