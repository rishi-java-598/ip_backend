// controllers/memberController.js
import { User } from "../models/user.model.js";

/**
 * Get profile details for a user
 * If member, they get their own info
 * Admin/Manager can optionally get other users by ID
 * 
 * req.user contains the logged-in user (set by auth middleware)
 * req.params.id optional: fetch other user's profile (admin/manager)
 */
export const getProfileDetails = async (req, res) => {
  try {
    const requestingUser = req.user; // from JWT middleware
    const userId = req.params.id || requestingUser._id;

    // If logged-in user is member, they can only fetch their own profile
    if (requestingUser.role === "member" && userId.toString() !== requestingUser._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Fetch user details
    const user = await User.findById(userId).select(
      "-password" // exclude password
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        membership: user.membership,
        uniqueIdCard: user.uniqueIdCard,
        status: user.status,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};
