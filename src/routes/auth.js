import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken"

const router = express.Router();

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

// create a user or sign up
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      dob,
      city,
      barangayComplainant,
      contact_num,
      role,
      password,
      valid_id,
    } = req.body;

    // call the static signup method directly (no "new")
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

    const token = createToken(user._id)

    res.status(201).json({contact_num, token});
  } catch (error) {
    console.error("Error in posting new user:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
});

export default router;