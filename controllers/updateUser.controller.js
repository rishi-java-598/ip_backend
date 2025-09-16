import { User } from "../models/user.model.js";

// ✅ Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from URL
    const updates = req.body;

    // Whitelist allowed fields for security
    const allowedFields = [
      "name",
      "email",
      "phone",
      "role",
      "membership",
      "uniqueIdCard",
      "status",
    ];

    const filteredUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Update and run validators
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // Handle duplicate key errors (unique email/phone/uniqueIdCard)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ message: `Duplicate value for ${field}: ${error.keyValue[field]}` });
    }

    return res.status(500).json({ message: "Error updating user", error: error.message });
  }
};
