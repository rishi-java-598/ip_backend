// controllers/adminController.js or managerController.js
import { User } from "../models/User.js";

/**
 * Update membership: activate/deactivate, change type, extend validity
 * req.body:
 *  - memberId (required)
 *  - status (optional: "active"/"inactive")
 *  - membershipType (optional: "Gold"/"Silver"/"Platinum")
 *  - extendValidity: { startDate, endDate } (optional)
 */
export const updateMembership = async (req, res) => {
  try {
    const { memberId, status, membershipType, extendValidity } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required." });
    }

    const member = await User.findOne({ _id: memberId, role: "member" });
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    // Update status
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid membership status." });
      }
      member.membership.status = status;
    }

    // Update membership type
    if (membershipType) member.membership.type = membershipType;

    // Extend validity
    if (extendValidity) {
      const { startDate, endDate } = extendValidity;
      if (startDate) member.membership.validity.startDate = new Date(startDate);
      if (endDate) member.membership.validity.endDate = new Date(endDate);
    }

    await member.save();

    res.status(200).json({
      message: "Membership updated successfully.",
      membership: member.membership
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating membership." });
  }
};
