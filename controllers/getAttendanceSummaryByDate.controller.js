// controllers/attendanceController.js
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
// checked
/**
 * Get attendance summary for a specific date
 * req.query.date - date to fetch summary
 */
// export const getAttendanceSummaryByDate = async (req, res) => {
//   try {
//     const { date } = req.query;

//     if (!date) {
//       return res.status(400).json({ message: "Date is required." });
//     }

//     const attendance = await Attendance.findOne({ date: new Date(date) })
//       .populate("presentMembers.memberId", "name email")
//       .populate("markedBy", "name email");

//     if (!attendance) {
//       return res.status(404).json({ message: "No attendance data found for this date." });
//     }

//     // Prepare summary
//     const slotSummary = {};
//     attendance.presentMembers.forEach(member => {
//       const slot = member.slot; // 1-9
//       if (!slotSummary[slot]) slotSummary[slot] = [];
//       slotSummary[slot].push({
//         memberId: member.memberId,
//         name: member.memberName,
//         membershipType: member.membershipType,
//         uniqueIdCard: member.uniqueIdCard
//       });
//     });

//     // Optional: total members count (fetch from User collection)
//     const totalMembers = await User.countDocuments({ role: "member", status: "registered" });

//     // Total present per slot
//     const totalPresentPerSlot = attendance.slotCounts;

//     res.status(200).json({
//       date: attendance.date,
//       markedBy: attendance.markedBy,
//       totalMembers,
//       totalPresentPerSlot,
//       slotSummary
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while fetching attendance summary." });
//   }
// };
// controllers/attendanceController.js

/**
 * Get attendance summary for a specific date
 * req.query.date - date to fetch summary
 */










//part2
// export const getAttendanceSummaryByDate = async (req, res) => {
//   try {
//     const { date } = req.query;
//     console.log(date);
    
//     if (!date) {
//       return res.status(400).json({ message: "Date is required." });
//     }

//     // Fetch attendance and populate memberId and markedBy
//     const attendance = await Attendance.findOne({ date: new Date(date) })
//       .populate({
//         path: "presentMembers.memberId",
//         select: "name email",
//         model: "User"
//       })
//       .populate({
//         path: "markedBy",
//         select: "name email",
//         model: "User"
//       });
// console.log(attendance);

//     if (!attendance) {
//       return res.status(404).json({ message: "No attendance data found for this date." });
//     }

//     // Prepare summary per slot
//     const slotSummary = {};
//     attendance.presentMembers.forEach(member => {
//       const slot = member.slot;
//       if (!slotSummary[slot]) slotSummary[slot] = [];

//       slotSummary[slot].push({
//         memberId: member.memberId?._id || null,
//         name: member.memberId?.name || member.memberName,
//         email: member.memberId?.email || null,
//         membershipType: member.membershipType,
//         uniqueIdCard: member.uniqueIdCard
//       });
//     });

//     // Total registered members in system
//     const totalMembers = await User.countDocuments({ role: "member", status: "registered" });

//     res.status(200).json({
//       date: attendance.date,
//       markedBy: attendance.markedBy || null,
//       totalMembers,
//       totalPresentPerSlot: attendance.slotCounts,
//       slotSummary
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while fetching attendance summary." });
//   }
// };











//part3

export const getAttendanceSummaryByDate = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("Query date:", date);

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    // Normalize query date to cover the whole day
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    // Fetch attendance within the day range
    const attendance = await Attendance.findOne({
      date: { $gte: start, $lte: end }
    })
      .populate({
        path: "presentMembers.memberId",
        select: "name email",
        model: "User"
      })
      .populate({
        path: "markedBy",
        select: "name email",
        model: "User"
      });

    console.log("Attendance found:", attendance);

    if (!attendance) {
      return res.status(404).json({ message: "No attendance data found for this date." });
    }

    // Prepare summary per slot
    const slotSummary = {};
    attendance.presentMembers.forEach(member => {
      const slot = member.slot;
      if (!slotSummary[slot]) slotSummary[slot] = [];

      slotSummary[slot].push({
        memberId: member.memberId?._id || null,
        name: member.memberId?.name || member.memberName,
        email: member.memberId?.email || null,
        membershipType: member.membershipType,
        uniqueIdCard: member.uniqueIdCard
      });
    });

    // Total registered members in system
    const totalMembers = await User.countDocuments({ role: "member", status: "registered" });

    res.status(200).json({
      date: attendance.date,
      markedBy: attendance.markedBy || null,
      totalMembers,
      totalPresentPerSlot: attendance.slotCounts,
      slotSummary
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching attendance summary." });
  }
};
