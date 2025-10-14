// controllers/managerController.js
import { Attendance } from "../models/attendance.model.js";
import { pma } from "../models/pma.model.js";
import { User } from "../models/user.model.js";
//checked
/**
 * Mark daily attendance
 * req.body: { date, slot, members: [{ memberId, memberName, membershipType, uniqueIdCard }] }
 * req.user: logged-in manager/admin
 */
// export const markDailyAttendance = async (req, res) => {
//   try {
//     const { date, slot, members } = req.body;
//     const markedBy = req.user.id; // Manager/Admin ID

//     if (!date || !slot || !members || !Array.isArray(members)) {
//       return res.status(400).json({ message: "Date, slot, and members array are required." });
//     }

//     const slotIndex = slot - 1; // assuming slot is 1-9

//     // Fetch or create today's attendance
//     let attendance = await Attendance.findOne({ date: new Date(date) });
//     if (!attendance) {
//       attendance = new Attendance({
//         date: new Date(date),
//         slotCounts: Array(9).fill(0),
//         presentMembers: [],
//         markedBy
//       });
//     }

//     // Add members to attendance
//     for (const member of members) {
//       // Check slot limit
//       if (attendance.slotCounts[slotIndex] >= 65) {
//         return res.status(400).json({ message: `Slot ${slot} is full (max 65 members).` });
//       }

//       // Prevent duplicate entry for the same member in the same slot
//       const alreadyPresent = attendance.presentMembers.some(
//         m => m.memberId.toString() === member.memberId && m.slot === slot
//       );
//       if (alreadyPresent) continue;

//       // Add to presentMembers
//       attendance.presentMembers.push({
//         memberId: member.memberId,
//         memberName: member.memberName,
//         membershipType: member.membershipType,
//         uniqueIdCard: member.uniqueIdCard,
//         slot
//       });

//       // Increment slot count
//       attendance.slotCounts[slotIndex]++;

//       // Update member attendance log
//       let memberLog = await pma.findOne({ memberId: member.memberId });
//       if (!memberLog) {
//         memberLog = new pma({ memberId: member.memberId, records: [] });
//       }
//       memberLog.records.push({ date: new Date(date), slot: `Slot ${slot}` });
//       await memberLog.save();
//     }

//     attendance.markedBy = markedBy;
//     await attendance.save();

//     res.status(200).json({ message: "Attendance marked successfully.", attendance });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while marking attendance." });
//   }
// };
// controllers/managerController.js


/**
 * Mark daily attendance
 * req.body: { date, slot, members: [{ memberId, memberName, membershipType, uniqueIdCard }] }
 * req.user: logged-in manager/admin
 */














//part1
// export const markDailyAttendance = async (req, res) => {
//   try {
//     const { date, slot, members } = req.body;
//     console.log(req.body);
    
//     const markedBy = req.user.id; // Manager/Admin ID

//     if (!date || !slot || !members || !Array.isArray(members)) {
//       return res.status(400).json({ message: "Date, slot, and members array are required." });
//     }

//     const slotIndex = slot - 1; // assuming slot is 1-9
//     const attendanceDate = new Date(date);

//     // Fetch or create today's attendance
//     let attendance = await Attendance.findOne({ date: attendanceDate });
//     if (!attendance) {
//       attendance = new Attendance({
//         date: attendanceDate,
//         slotCounts: Array(9).fill(0),
//         presentMembers: [],
//         markedBy
//       });
//     }

//     // Add members to attendance
//     for (const member of members) {
//       // Check if already visited gym today (in ANY slot)
//       const alreadyVisitedToday = attendance.presentMembers.some(
//         m => m.memberId.toString() === member.memberId
//       );
//       if (alreadyVisitedToday) {
//         return res.status(400).json({
//           message: `User ${member.memberName} has already visited the gym today.`
//         });
//       }

//       // Check slot limit
//       if (attendance.slotCounts[slotIndex] >= 65) {
//         return res.status(400).json({ message: `Slot ${slot} is full (max 65 members).` });
//       }

//       // Prevent duplicate entry for the same member in the same slot
//       const alreadyPresentInSlot = attendance.presentMembers.some(
//         m => m.memberId.toString() === member.memberId && m.slot === slot
//       );
//       if (alreadyPresentInSlot) continue;

//       // Add to presentMembers
//       attendance.presentMembers.push({
//         memberId: member.memberId,
//         memberName: member.memberName,
//         membershipType: member.membershipType,
//         uniqueIdCard: member.uniqueIdCard,
//         slot
//       });

//       // Increment slot count
//       attendance.slotCounts[slotIndex]++;

//       // Update member attendance log
//       let memberLog = await pma.findOne({ memberId: member.memberId });
//       if (!memberLog) {
//         memberLog = new pma({ memberId: member.memberId, records: [] });
//       }
//       memberLog.records.push({ date: attendanceDate, slot: `Slot ${slot}` });
//       await memberLog.save();
//     }

//     attendance.markedBy = markedBy;
//     await attendance.save();

//     res.status(200).json({ message: "Attendance marked successfully.", attendance });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while marking attendance." });
//   }
// };



























// main
export const markDailyAttendance = async (req, res) => {
  try {
    const { date, members } = req.body;
    console.log(date);
    console.log(members);
    
    const markedBy = req.user.id; // Manager/Admin ID

    if (!date || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Date and members array are required." });
    }

    // normalize date to one day (00:00:00 → 23:59:59)
    // const start = new Date(date); start.setHours(0, 0, 0, 0);
    // const end = new Date(date); end.setHours(23, 59, 59, 999);

// normalize to local date boundaries
const start = new Date(date + "T00:00:00"); 
const end   = new Date(date + "T23:59:59.999");


    // fetch or create today's attendance
    let attendance = await Attendance.findOne({ date: { $gte: start, $lte: end } });
    if (!attendance) {
      attendance = new Attendance({
        date: start,
        slotCounts: Array(9).fill(0),
        presentMembers: [],
        markedBy
      });
    }

    const errors = [];
    const updates = [];

    for (const member of members) {
      if (!member.slot || typeof member.slot !== "number" || member.slot < 1 || member.slot > 9) {
        errors.push(`Invalid slot for member ${member.memberName}`);
        continue;
      }

      const slotIndex = member.slot - 1;

      // check if already marked today
      const alreadyMarked = attendance.presentMembers.some(
        m => m.memberId.toString() === member.memberId
      );
      if (alreadyMarked) {
        errors.push(`User ${member.memberName} already marked today.`);
        continue;
      }

      // check slot capacity
      if (attendance.slotCounts[slotIndex] >= 65) {
        errors.push(`Slot ${member.slot} is full for user ${member.memberName}.`);
        continue;
      }
      
      // add member to today's attendance
      attendance.presentMembers.push({
        memberId: member.memberId,
        memberName: member.memberName,
        memberEmail: member.memberEmail || null,
        membershipType: member.membershipType,
        uniqueIdCard: member.uniqueIdCard,
        slot: member.slot
      });
      attendance.slotCounts[slotIndex]++;

      // update personal log
      // console.log(member.memberEmail);
      
      updates.push(
        (async () => {
          let log = await pma.findOne({ memberId: member.memberId });
          if (!log) log = new pma({ memberId: member.memberId, 
            // added for email change
            memberEmail: member.memberEmail,
            memberName: member.memberName
            , records: [] });
          log.records.push({ date: start, slot: `Slot ${member.slot}` });
          return log.save();
        })()
      );
    }

    attendance.markedBy = markedBy;
    await Promise.all([attendance.save(), ...updates]);

    res.status(200).json({
      message: "Attendance processed.",
      attendance,
      errors: errors.length ? errors : undefined
    });
  } catch (error) {
    console.error("Error in markDailyAttendance:", error);
    res.status(500).json({ message: "Server error while marking attendance." });
  }
};



export const getTodayAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    // const start = new Date(date); start.setHours(0,0,0,0);
    // const end = new Date(date); end.setHours(23,59,59,999);
// normalize to local date boundaries
const start = new Date(date + "T00:00:00"); 
const end   = new Date(date + "T23:59:59.999");

    const attendance = await Attendance.findOne({ date: { $gte: start, $lte: end } });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found for today." });
    }

    res.status(200).json({
      date: attendance.date,
      presentMembers: attendance.presentMembers,
      slotCounts: attendance.slotCounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching today's attendance" });
  }
};


export const deleteMemberFromTodayAttendance = async (req, res) => {
  try {
    const { date, memberId } = req.body;
    if (!date || !memberId) return res.status(400).json({ message: "Date and memberId are required" });

    // const start = new Date(date); start.setHours(0,0,0,0);
    // const end = new Date(date); end.setHours(23,59,59,999);
// normalize to local date boundaries
const start = new Date(date + "T00:00:00"); 
const end   = new Date(date + "T23:59:59.999");

    const attendance = await Attendance.findOne({ date: { $gte: start, $lte: end } });
    if (!attendance) return res.status(404).json({ message: "No attendance for today" });

    const member = attendance.presentMembers.find(m => String(m.memberId) === String(memberId));
    if (!member) return res.status(404).json({ message: "Member not found in attendance" });

    // decrease slot count
    attendance.slotCounts[member.slot - 1] = Math.max(0, attendance.slotCounts[member.slot - 1] - 1);

    // remove member
    attendance.presentMembers = attendance.presentMembers.filter(m => String(m.memberId) !== String(memberId));
    await attendance.save();

    // also update personal log
    await pma.updateOne(
      { memberId },
      { $pull: { records: { date: start } } }
    );

    res.status(200).json({ message: "Member removed from today's attendance", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting member from attendance" });
  }
};


export const updateMemberSlot = async (req, res) => {
  try {
    const { date, memberId, newSlot } = req.body;
    if (!date || !memberId || !newSlot) {
      return res.status(400).json({ message: "Date, memberId and newSlot are required" });
    }

    if (newSlot < 1 || newSlot > 9) {
      return res.status(400).json({ message: "Invalid slot number" });
    }

    // const start = new Date(date); start.setHours(0,0,0,0);
    // const end = new Date(date); end.setHours(23,59,59,999);
    // normalize to local date boundaries
const start = new Date(date + "T00:00:00"); 
const end   = new Date(date + "T23:59:59.999");


    const attendance = await Attendance.findOne({ date: { $gte: start, $lte: end } });
    if (!attendance) return res.status(404).json({ message: "No attendance for today" });

    const member = attendance.presentMembers.find(m => String(m.memberId) === String(memberId));
    if (!member) return res.status(404).json({ message: "Member not found in attendance" });

    // check slot capacity
    if (attendance.slotCounts[newSlot - 1] >= 65) {
      return res.status(400).json({ message: `Slot ${newSlot} is already full` });
    }

    // decrease old slot count
    attendance.slotCounts[member.slot - 1] = Math.max(0, attendance.slotCounts[member.slot - 1] - 1);

    // update slot
    member.slot = newSlot;
    attendance.slotCounts[newSlot - 1]++;

    await attendance.save();

    // update personal log
    await pma.updateOne(
      { memberId },
      { $set: { "records.$[elem].slot": `Slot ${newSlot}` } },
      { arrayFilters: [{ "elem.date": start }] }
    );

    res.status(200).json({ message: "Slot updated successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating member slot" });
  }
};
