// controllers/adminController.js
import { DeleteUserRequest } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { pma } from "../models/pma.model.js";
/**
 * Approve a user deletion request
 * This will delete the user after approval
 */

//checked

export const approveUserDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await DeleteUserRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Deletion request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    // Approve request
    request.status = "approved";
    await request.save();

    // Delete user after approval
    await deleteUserById(request.targetUser);

    res.status(200).json({ message: "User deletion approved and completed." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while approving deletion request." });
  }
};



/**
 * Helper to delete user & clean up attendance
 */
export const deleteUserById = async (userId) => {
  // Remove user from Users collection
  await User.findByIdAndDelete(userId);

  // Remove from Attendance presentMembers arrays
  await Attendance.updateMany(
    {},
    { $pull: { presentMembers: { memberId: userId } } }
  );

  // Remove from personal attendance log
  await pma.deleteOne({ memberId: userId });

  // Also remove pending deletion request if exists
  await DeleteUserRequest.deleteMany({ memberId: userId });
};

/**
 * Controller for admin to delete a user directly
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await deleteUserById(userId);

    res.status(200).json({ message: "User deleted successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};


export const getAllDeletionRequests = async (req, res) => {
  try {
    const requests = await DeleteUserRequest.find({ status: "pending" })
     
    res.status(200).json({ requests });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching deletion requests." });
  }
};


export const rejectUserDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await DeleteUserRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Deletion request not found." });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending." });
    }

    // Reject request
    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "User deletion request rejected." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while rejecting deletion request." });
  }
};