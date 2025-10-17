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
      status: "pending",
      //added fields
      name:member.name,
      email:member.email,
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

// controllers/deleteUserRequest.controller.js

export const getDeleteUserRequests = async (req, res) => {

  console.log("Fetching delete user requests with query:", req.query);
  
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    // 🔍 Searching (check user ID or action or populate user name/email later)
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Filter by status
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    // 🔽 Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // ✅ Fetch with pagination
    const requests = await DeleteUserRequest.find(query)
      // .populate("targetUser", "name email phone role") 
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

      console.log(requests);
      
    const total = await DeleteUserRequest.countDocuments(query);

    res.json({
      data: requests,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
