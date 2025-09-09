// controllers/attendanceController.js
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
// left
/**
 * Get attendance summary for a specific date
 * req.query.date - date to fetch summary
 */
export const getAttendanceSummaryByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const attendance = await Attendance.findOne({ date: new Date(date) })
      .populate("presentMembers.memberId", "name email")
      .populate("markedBy", "name email");

    if (!attendance) {
      return res.status(404).json({ message: "No attendance data found for this date." });
    }

    // Prepare summary
    const slotSummary = {};
    attendance.presentMembers.forEach(member => {
      const slot = member.slot; // 1-9
      if (!slotSummary[slot]) slotSummary[slot] = [];
      slotSummary[slot].push({
        memberId: member.memberId,
        name: member.memberName,
        membershipType: member.membershipType,
        uniqueIdCard: member.uniqueIdCard
      });
    });

    // Optional: total members count (fetch from User collection)
    const totalMembers = await User.countDocuments({ role: "member", status: "registered" });

    // Total present per slot
    const totalPresentPerSlot = attendance.slotCounts;

    res.status(200).json({
      date: attendance.date,
      markedBy: attendance.markedBy,
      totalMembers,
      totalPresentPerSlot,
      slotSummary
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching attendance summary." });
  }
};
