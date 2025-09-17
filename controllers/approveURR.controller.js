// controllers/adminController.js (or managerController.js if manager can approve)
import { User } from "../models/user.model.js";
//checked

/**
 * Approve a pending user registration
 * @param req.body.userId - ID of the user to approve
 */
export const approveUserRegistration = async (req, res) => {
  try {
    // const { userId } = req.body;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find the user with status pending
    const user = await User.findOne({ _id: userId, status: "pending" });

    if (!user) {
      return res.status(404).json({ message: "Pending user not found." });
    }

    // Update status to registered
    user.status = "registered";
    await user.save();

    res.status(200).json({
      message: "User registration approved successfully.",
      userId: user._id,
      status: user.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while approving user." });
  }
};


export const rejectUserRegistration = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    // Find the user with status pending
    const user = await User.findOne({ _id: userId, status: "pending" });
    if (!user) {
      return res.status(404).json({ message: "Pending user not found." });
    }
    // Delete the user
    await User.deleteOne({ _id: userId });
    res.status(200).json({ message: "User registration rejected and user deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while rejecting user." });
  } 
};