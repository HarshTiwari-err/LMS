const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
// ! resetPasswordToken
const resetPasswordToken = async function (req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "All fields required",
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }
    const token = user.generateJWT("5min");
    try {
      const mailResponse = await mailSender(
        email,
        "Reset Password request from Edtech",
        `<a href="http://localhost:3000/forgot-password/${token}">Reset Password</a>`
      );
      console.log("Mail sent successfully", mailResponse);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Error in sending mail",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Reset Password token generated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in reset Password token generation",
    });
  }
};

// resetPassword
const resetPassword = async function (req, res, next) {
  try {
    const { newPassword, confirmNewPassword, token } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(401).json({
        success: false,
        message: "Both password does not matches",
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    let decode;
    try {
      decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decode", decode);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { _id } = decode;
    const updateUser = await User.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      { new: true }
    );

    updateUser.password = undefined;
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Reset password failed",
    });
  }
};

module.exports = { resetPasswordToken, resetPassword };
