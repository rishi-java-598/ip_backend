// controllers/adminController.js or managerController.js
import { User } from "../models/user.model.js";

/**
 * Edit membership details for a member
 * req.body: { memberId, membershipType, startDate, endDate, status }
 */
export const editMembership = async (req, res) => {
  try {
    const { memberId, membershipType, startDate, endDate, status } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required." });
    }

    // Find the member
    const member = await User.findOne({ _id: memberId, role: "member" });
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    // Update membership details if provided
    if (membershipType) member.membership.type = membershipType;
    if (startDate) member.membership.validity.startDate = new Date(startDate);
    if (endDate) member.membership.validity.endDate = new Date(endDate);
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid membership status." });
      }
      member.membership.status = status;
    }

    await member.save();

    res.status(200).json({
      message: "Membership updated successfully.",
      memberId: member._id,
      membership: member.membership
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating membership." });
  }
};
