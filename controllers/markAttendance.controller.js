// controllers/managerController.js
import { Attendance } from "../models/attendance.model.js";
import { pma } from "../models/pma.model.js";
import { User } from "../models/user.model.js";

/**
 * Mark daily attendance
 * req.body: { date, slot, members: [{ memberId, memberName, membershipType, uniqueIdCard }] }
 * req.user: logged-in manager/admin
 */
export const markDailyAttendance = async (req, res) => {
  try {
    const { date, slot, members } = req.body;
    const markedBy = req.user._id; // Manager/Admin ID

    if (!date || !slot || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Date, slot, and members array are required." });
    }

    const slotIndex = slot - 1; // assuming slot is 1-9

    // Fetch or create today's attendance
    let attendance = await Attendance.findOne({ date: new Date(date) });
    if (!attendance) {
      attendance = new Attendance({
        date: new Date(date),
        slotCounts: Array(9).fill(0),
        presentMembers: [],
        markedBy
      });
    }

    // Add members to attendance
    for (const member of members) {
      // Check slot limit
      if (attendance.slotCounts[slotIndex] >= 65) {
        return res.status(400).json({ message: `Slot ${slot} is full (max 65 members).` });
      }

      // Prevent duplicate entry for the same member in the same slot
      const alreadyPresent = attendance.presentMembers.some(
        m => m.memberId.toString() === member.memberId && m.slot === slot
      );
      if (alreadyPresent) continue;

      // Add to presentMembers
      attendance.presentMembers.push({
        memberId: member.memberId,
        memberName: member.memberName,
        membershipType: member.membershipType,
        uniqueIdCard: member.uniqueIdCard,
        slot
      });

      // Increment slot count
      attendance.slotCounts[slotIndex]++;

      // Update member attendance log
      let memberLog = await pma.findOne({ memberId: member.memberId });
      if (!memberLog) {
        memberLog = new pma({ memberId: member.memberId, records: [] });
      }
      memberLog.records.push({ date: new Date(date), slot: `Slot ${slot}` });
      await memberLog.save();
    }

    attendance.markedBy = markedBy;
    await attendance.save();

    res.status(200).json({ message: "Attendance marked successfully.", attendance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while marking attendance." });
  }
};
