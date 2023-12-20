const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");
const { isAuth, isStudent } = require("../middlewares/auth");
router
.post("/capturePayment", isAuth,isStudent,capturePayment)
.post("/verifySignature",verifySignature)

module.exports = router
