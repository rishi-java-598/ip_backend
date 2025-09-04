// controllers/authController.js
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

// New user registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, membership } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or phone already exists." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with status: pending
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      membership: role === "member" ? membership : null, // Only members have membership
      status: "pending",
      createdAt: new Date()
    });

    await newUser.save();

    res.status(201).json({
      message: "User registration request submitted. Waiting for admin approval.",
      userId: newUser._id,
      status: newUser.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};
