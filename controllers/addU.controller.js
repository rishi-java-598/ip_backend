// controllers/adminController.js or managerController.js
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
//checked

/**
 * Add a new user (admin or manager)
 * @param req.body: { name, email, password, phone, role, membership }
 */
export const addUser = async (req, res) => {
  try {
    const { name, email, password, phone, role,Gender, membership,uniqueIdCard } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role||!Gender||!uniqueIdCard) {
      console.log(req.body);
      
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check for duplicate email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or phone already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      uniqueIdCard,
      Gender,
      email,
      password: hashedPassword,
      phone,
      role,
      membership: membership ? membership : null,
      status: "registered", // Directly registered
      createdAt: new Date()
    });

    await newUser.save();

    res.status(201).json({
      message: "User added successfully. Share credentials with the user personally.",
      userId: newUser._id,
      email: newUser.email,
      password: password, // Send original password so admin/manager can share (do not save plain password!)
      status: newUser.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding user." });
  }
};


import { DeleteUserRequest } from '../models/request.model.js';

// Delete User Controller
export const deleteUser = async (req, res) => {
  try {console.log("hitted");
  
    const userId = req.params.id; // Assuming user ID is passed in URL

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Delete related delete user requests (if any)
    await DeleteUserRequest.deleteMany({ targetUser: userId });

    // Optionally, you can add anonymization here for attendance and pma data if needed.

    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
