// controllers/adminController.js
import { UserDeletionRequest } from "../models/UserDeletionRequest.js";
import { User } from "../models/User.js";
import { Attendance } from "../models/Attendance.js";
import { pma } from "../models/MemberAttendanceLog.js";

/**
 * Approve a user deletion request
 * This will delete the user after approval
 */
export const approveUserDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await UserDeletionRequest.findById(requestId);
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
    await deleteUserById(request.memberId);

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
  await UserDeletionRequest.deleteMany({ memberId: userId });
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
