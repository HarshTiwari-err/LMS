const Course = require("../models/Course");
const Section = require("../models/Section");

// create Section
const createSection = async function (req, res, next) {
  try {
    //! make sure courseId is not length > specific amount as it is breaking the code
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    // ! check if course is present or not
    console.log("till here");
    const checkCourse = await Course.findById(courseId);
    console.log("checkCourse", checkCourse);
    if (!checkCourse) {
      return res.json({
        success: false,
        message: "Not a valid course",
      });
    }
    const section = new Section({
      sectionName,
    });
    const newSection = await section.save();

    const updateCourseContent = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );
    // .populate({
    //   path: "courseContent",
    //   select: "sectionName subSection",
    //   populate: {
    //     path: "subSection",
    //     model: "Section",
    //     populate: {
    //       path: "subSection",
    //       model: "subSection",
    //     },
    //   },
    // })
    // .exec();

    // use populate to replace section/subsection both in the updatedCourseContent
    return res.status(201).json({
      success: true,
      message: "Empty Section created",
      sectionId: newSection._id,
      updateCourseContent, // !
    });
  } catch (error) {
    console.log("Error while creating section", error);
    return res.status(500).json({
      success: false,
      message: "Couldn't create section",
    });
  }
};

// update section
const updateSection = async function (req, res, next) {
  try {
    const { sectionName, sectionId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const updateSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        sectionName,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
      updateSection, // !
    });
  } catch (error) {
    console.log("Error while updating section");
    return res.status(500).json({
      success: false,
      message: "Could not update section",
    });
  }
};

// delete section
const deleteSection = async function (req, res, next) {
  try {
    const { sectionId } = req.body;
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const deleteSection = await Section.findByIdAndDelete({ _id: sectionId });
    // ! Todo : Delete the sectionId from Course Schema

    // ! Todo : Implement deleting corresponding subsection and their cloudinary media associated with it
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting the section");
    return res.status(500).json({
      success: false,
      message: "Could not delete Section",
    });
  }
};

module.exports = { createSection, updateSection, deleteSection };

// !
// const associatedSubsections = section.subSection;

// // Step 3: Delete the section
// await Section.findByIdAndDelete(sectionId);

// // Step 4: Delete the associated subsections
// for (const subSectionId of associatedSubsections) {
//   await SubSection.findByIdAndDelete(subSectionId);
// }
// cloudinary.uploader.destroy(publicId, function
