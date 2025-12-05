import express from "express";
import User from "../models/User.js";
import requireAuth from "../middleware/requireAuth.js";
import bcrypt from "bcrypt";
import validator from "validator";

const router = express.Router();

//users need to be logged in in order to make requests
router.use(requireAuth);

//get all user
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getting all users", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//get a user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user does not exist" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getting a user", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: hash,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = user.token;
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
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update user info by id
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      dob,
      city,
      barangayComplainant,
      contact_num,
      password,
      role,
      valid_id,
    } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        dob,
        city,
        barangayComplainant,
        contact_num,
        password,
        role,
        valid_id,
      },
      {
        new: true,
      }
    );
    if (!updatedUser)
      return res
        .status(404)
        .json({ message: "User not found, updating failed" });
    res.status(201).json(updatedUser);
  } catch (error) {
    console.error("Error in updating a user's info", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//delete user by id
router.delete("/:id", async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    if (!deleteUser)
      return res
        .status(404)
        .json({ message: "User not found, deletion failed" });
    res.status(200).json({ message: "successfully deleted" });
  } catch (error) {
    console.error("Error in deleting a user", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
