const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["Admin", "Instructor", "Student"],
      required: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true, // ! check whether required or not
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    // subSectionCount: [
    //   {
    //     count: {
    //       type: Number,
    //       default: 0,
    //     },
    //     course: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Course",
    //     },
    //   },
    // ],
    image: {
      type: String,
      required: true,
    },
    courseProgress: [
      { type: mongoose.Schema.Types.ObjectId, ref: "courseProgress" },
    ],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ! hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.validatePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    console.log("Is password true - ", isMatch);
    return isMatch;
  } catch (err) {
    throw new Error("Error while comparing password");
  }
};

userSchema.methods.generateJWT =  function () {
  const payload = {
    _id: this._id,
    email: this.email,
    accountType: this.accountType,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h", // You can customize the expiration time
  });
  this.password = undefined;
  return token;
};

module.exports = mongoose.model("User", userSchema);
