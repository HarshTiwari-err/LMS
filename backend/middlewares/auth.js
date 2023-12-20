const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth

const isAuth = async function (req, res, next) {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");
    console.log("Token ", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
    // verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decode", decode);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token in invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// isStudent

const isStudent = async function (req, res, next) {
  try {
    const { accountType } = req.user;
    if (accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User can't be verified, please try again",
    });
  }
};

// isInstructor

const isInstructor = async function (req, res, next) {
  try {
    const { accountType } = req.user;
    if (accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User can't be verified, please try again",
    });
  }
};

// isAdmin

const isAdmin = async function (req, res, next) {
  try {
    const { accountType } = req.user;
    if (accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User can't be verified, please try again",
    });
  }
};

module.exports = { isAuth, isStudent, isInstructor, isAdmin };
