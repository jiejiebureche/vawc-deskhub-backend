import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import twilio from "twilio";
import dotenv from "dotenv";

import { formatContactNum } from "../utils/phone.js";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

const router = express.Router();

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads"); // relative to project root
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

//login endpoint
router.post("/login", async (req, res) => {
  try {
    const { contact_num, password } = req.body;
    const user = await User.login(contact_num, password);
    const formattedContactNum = formatContactNum(user?.contact_num);

    await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: formattedContactNum, channel: "sms" });

    res.status(200).json({
      success: true,
      message: "Credentials verified, OTP sent.",
    });
  } catch (error) {
    console.error("Error in logging user in:", error);
    res.status(400).json({
      message: error.message || "Internal server error",
    });
  }
});

router.post("/verify-login", async (req, res) => {
  const { contact_num, code } = req.body;
  const formattedContactNum = formatContactNum(contact_num);

  if (!contact_num || !code) {
    return res
      .status(400)
      .json({ message: "Phone number and code are required" });
  }

  try {
    //verify otp
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: formattedContactNum, code: code });

    //check if success
    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ contact_num });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Create token and send back user data
    const token = createToken(user._id);

    const safeUser = {
      id: user._id,
      name: user.name,
      dob: user.dob,
      barangayComplainant: user.barangayComplainant,
      city: user.city,
      role: user.role,
      contact_num: user.contact_num,
    };

    res.status(201).json({ safeUser, token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
});

router.post("/signup", upload.single("valid_id"), async (req, res) => {
  try {
    const {
      name,
      dob,
      city,
      barangayComplainant,
      contact_num,
      role,
      password,
    } = req.body;

    //validation if fields are empty
    if (
      !name ||
      !dob ||
      !city ||
      !barangayComplainant ||
      !contact_num ||
      !role ||
      !password
    ) {
      // delete uploaded file if it exists
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "All fields must be filled!" });
    }

    //check if contact_num exists
    const existingUser = await User.findOne({ contact_num });
    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Contact number already taken!" });
    }

    const valid_id = [
      {
        fileType: req.file.mimetype, // "image/jpeg", etc.
        url: req.file.path, // e.g. "src/uploads/id.jpg"
      },
    ];

    const user = await User.signup(
      name,
      dob,
      city,
      barangayComplainant,
      role,
      valid_id,
      contact_num,
      password
    );

    const token = createToken(user._id);

    res.status(201).json({ contact_num, token });
  } catch (error) {
    console.error("Error in posting new user:", error);

    // delete uploaded file if error happens
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
});

export default router;
