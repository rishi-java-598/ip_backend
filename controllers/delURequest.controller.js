// controllers/managerController.js
import { DeleteUserRequest } from "../models/DeleteUserRequest.js";
import { User } from "../models/User.js";

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
