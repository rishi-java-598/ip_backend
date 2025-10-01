// controllers/managerController.js
import { DeleteUserRequest } from "../models/request.model.js";
import { User } from "../models/user.model.js";
//checked

/**
 * Manager submits a delete request for a member
 * @param req.body.userId - ID of the member to delete
 */
export const requestDeleteMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Check if the target user exists and is a member
    const member = await User.findOne({ _id: userId, role: "member" });
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    // Check if a pending delete request already exists
    const existingRequest = await DeleteUserRequest.findOne({
      targetUser: userId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A delete request for this member is already pending." });
    }

    // Create a new delete request
    const deleteRequest = await DeleteUserRequest.create({
      targetUser: userId,
      action: "deleteUser", // Only one action in this schema
      status: "pending"
    });

    res.status(201).json({
      message: "Delete request submitted successfully. Waiting for admin approval.",
      requestId: deleteRequest._id,
      status: deleteRequest.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while submitting delete request." });
  }
};

// export const deleteUserDelRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     if (!requestId) {
//       return res.status(400).json({ message: "Request ID is required." });
//     }
//     const deleteRequest = await DeleteUserRequest.findById(requestId);
//     if (!deleteRequest) {
//       return res.status(404).json({ message: "Delete request not found." });
//     }

//     // Proceed with deletion logic
//     await User.findByIdAndDelete(deleteRequest.targetUser);
//     await DeleteUserRequest.findByIdAndDelete(requestId);

//     res.status(200).json({ message: "User deleted successfully." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while deleting user." });
//   }
// };