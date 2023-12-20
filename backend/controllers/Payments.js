const User = require("../models/User");
const Course = require("../models/Course");
const instance = require("../config/razorpay");
const mailSender = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");

const capturePayment = async function (req, res, next) {
  try {
    // data fetch
    const { courseId } = req.body;
    const userId = req.user._id;
    // entry validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid userId",
      });
    }
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid courseID",
      });
    }
    // valid courseDetail
    let course;
    try {
      course = await Course.findById({ _id: courseId });
      if (!course) {
        return res.json({
          success: false,
          message: "Could not find the course",
        });
      }
      // user already pay for the same course
      const uid = new mongoose.Types.ObjectId(userId); // ! actually db mei _id object mei hai aur userId jo hai vo abhi string mei hai
      if (course.studentsEnrolled.includes(uid)) {
        // ! you can query in User's courseEnrolled to minimize time
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
    } catch (error) {
      console.log("Error while verifying course");
      return res.status(500).json({
        success: false,
        message: "Course not verified",
      });
    }
    // order create
    var options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: Date.now().toString(),
      notes: {
        courseId,
        userId,
      },
    };
    try {
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(200).json({
        success: true,
        message: "Order initiated",
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        courseThumbnail: course.courseThumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.log("Error while creating order");
      return res.status(500).json({
        success: false,
        message: "Could not initiate order",
      });
    }

    // return response
  } catch (error) {
    console.log("Error while capturing payment");
    return res.status(500).json({
      success: false,
      message: "Could not capture payment",
    });
  }
};

const verifySignature = async function (req, res, next) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET // process.env.webhooksecret
    const signature = req.headers["x-razorpay-signature"]; // ye razorpay se hash hoke aya ha

    // ! convert webhook secret to digest
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex ");

    if (signature === digest) {
      console.log("Payment is authorised");

      // Ab bache ko course mei enroll karaun  notes se ayegi courseId and userID ab kyunki ye to webhook razorpay se hit kar rha hai
      const { courseId, userId } = req.body.payload.payment.entity.notes;
      try {
        const studentsEnrolled = await Course.findByIdAndUpdate(
          { _id: courseId },
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );

        if (!studentsEnrolled) {
          return res.status(500).json({
            success: false,
            message: "Course not found",
          });
        }
        console.log(studentsEnrolled);

        const enrolledCourse = await User.findByIdAndUpdate(
          { _id: userId },
          { $push: { courses: courseId } },
          { new: true }
        );

        if (!enrolledCourse) {
          return res.status(500).json({
            success: false,
            message: "User not found",
          });
        }
        console.log(enrolledCourse);

        // send mail
        const emailResponse = await mailSender(
          enrolledCourse.email,
          "Congrats from Edtech",
          "Congrats, You are added to new Edtech Course"
        );

        return res.status(200).json({
          success: true,
          message: "Signature verified and course added",
        });
      } catch (err) {
        console.log("Bad request");
        return res.status(500).json({
          success: false,
          message: "Invalid details from webhook",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log("Error in verification");
    return res.status(500).json({
      success: false,
      message: "Could not verify payment",
    });
  }
};

module.exports = { capturePayment, verifySignature };
