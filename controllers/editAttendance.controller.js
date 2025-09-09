// controllers/adminController.js
import { Attendance } from "../models/attendance.model.js";
import { pma } from "../models/pma.model.js";
//checked
/**
 * Edit attendance data for a specific date
 * req.body:
 *   - date
 *   - slot (1-9)
 *   - addMembers: [{ memberId, memberName, membershipType, uniqueIdCard, slot }]
 *   - removeMembers: [memberId]
 */
export const editAttendance = async (req, res) => {
  try {
    const { date, slot, addMembers = [], removeMembers = [] } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ message: "Date and slot are required." });
    }

    const slotIndex = slot - 1;

    // Fetch the attendance document for the day
    const attendance = await Attendance.findOne({ date: new Date(date) });
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found for this date." });
    }

    // Remove members
    for (const memberId of removeMembers) {
      const removed = attendance.presentMembers.filter(
        m => !(m.memberId.toString() === memberId && m.slot === slot)
      );
      const removedCount = attendance.presentMembers.length - removed.length;
      attendance.presentMembers = removed;
      attendance.slotCounts[slotIndex] -= removedCount;

      // Update member attendance log
      await pma.updateOne(
        { memberId },
        { $pull: { records: { date: new Date(date), slot: `Slot ${slot}` } } }
      );
    }

    // Add members
    for (const member of addMembers) {
      if (attendance.slotCounts[slotIndex] >= 65) {
        return res.status(400).json({ message: `Slot ${slot} is full (max 65 members).` });
      }

      const alreadyPresent = attendance.presentMembers.some(
        m => m.memberId.toString() === member.memberId && m.slot === slot
      );
      if (alreadyPresent) continue;

      attendance.presentMembers.push({
        memberId: member.memberId,
        memberName: member.memberName,
        membershipType: member.membershipType,
        uniqueIdCard: member.uniqueIdCard,
        slot
      });

      attendance.slotCounts[slotIndex]++;

      // Update member attendance log
      let memberLog = await pma.findOne({ memberId: member.memberId });
      if (!memberLog) {
        memberLog = new pma({ memberId: member.memberId, records: [] });
      }
      memberLog.records.push({ date: new Date(date), slot: `Slot ${slot}` });
      await memberLog.save();
    }

    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully.", attendance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while editing attendance." });
  }
};
