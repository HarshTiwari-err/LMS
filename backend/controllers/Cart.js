const Course = require("../models/Course");
const User = require("../models/User");

const addToCart = async function (req, res, next) {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    //! you can check if course exists or not
    const userCart = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          cart: courseId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course added to Cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

const removeFromCart = async function (req, res, next) {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    //! you can check if course exists or not
    const removeCart = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          cart: courseId,
        },
      },
      { new: true }
    );
    console.log("Removed course", removeCart);
    return res.status(200).json({
      success: true,
      message: "Course removed from Cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

module.exports = { addToCart, removeFromCart };
