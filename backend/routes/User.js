const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/Auth");
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");
const { updateProfile } = require("../controllers/Profile");
const { isAuth } = require("../middlewares/auth"); // middlewares
// User
// singup
router
  .post("/sendOTP", sendOTP)
  .post("/signup", signUp)
  .post("/login", login)
  .post("/reset-password-token", resetPasswordToken)
  .post("/reset-password", resetPassword)
  .post("/change-password", isAuth, changePassword)
  .post("/update-profile", isAuth, updateProfile);
module.exports = router;
