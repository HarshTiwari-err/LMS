const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");

// ! sendOTP

const sendOTP = async function (req, res) {
  try {
    const { email } = req.body;
    let checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    // generate otp
    let otp;
    while (true) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      // ! check whether otp is unique
      let checkUniqueOtp = await OTP.findOne({ otp: otp });
      if (!checkUniqueOtp) break;
    }

    const otpPayload = { email, otp };

    // create an entry in db
    const createOTP = new OTP(otpPayload);
    const otpbody = await createOTP.save();

    console.log(otpbody);

    res.status(200).json({
      success: true,
      message: "OTP sent",
      otp,  // ! remove it later
    });
  } catch (error) {
    console.log("error in otp", error);
    res.status(500).json({
      success: false,
      message: "OTP generation failed",
    });
  }
};

// ! signup

const signup = async function (req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contact,
      otp,
    } = req.body;

    // validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    // check if email already exists
    let checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    // ! find most recent OTP stored for the email
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    // validate otp
    if (recentOtp.otp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    let profile = new Profile({
      gender: null,
      dateOfBirth: null,
      about: null,
      contact: contact&&null,
    });
    let profileDetails = await profile.save();

    let userObj = new User({
      firstName,
      lastName,
      email,
      password,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    let newUser = await userObj.save();

    return res.status(200).json({
      user: newUser,  // ! remove this later on for security 
      message: "Successfully SignUp",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Signup error",
    });
  }
};

// ! login

const login = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check email present
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email",
      });
    }
    console.log(user);

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password", // ! make it invalid email or password later for security
      });
    }

    const token = user.generateJWT("2h");

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user,  // ! remove this later on
    });
  } catch (error) {
    console.log("Error while login", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ! changePassword

const mailSender = require("../utils/mailSender");
const changePassword = async function (req, res, next) {
  try {
    // get data from req which is updated from middleware before this auth
    const { email, _id } = req.user;  // ! make sure it is from decode in req.user
    // get oldPassword, newPassword, confirmNewPassword
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    // validation
    if (!email || !_id || !oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(401).json({
        success: false,
        messge: "All fields required",
      });
    }
    // compare oldPassword with db
    let user = await User.findById(_id);
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password", // ! make it invalid email or password later for security
      });
    }
    // update password in db
    const updatedUserPass = await User.findByIdAndUpdate(
      _id,
      { password: newPassword },
      {
        new: true,
      }
    );
    console.log(updatedUserPass);
    // send mail password updated
    try {
      const mailResponse = await mailSender(
        email,
        "Update Password Notification from Edtech",
        "<h1>Password Updated</h1>"
      );
      console.log("Mail sent successfully", mailResponse);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Error in sending mail",
      });
    }

    // return response
    return res.status(201).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error while change password", error);
    return res.status(500).json({
      success: false,
      message: "Error in changing the password",
    });
  }
};

module.exports = { sendOTP, signup, login, changePassword };
