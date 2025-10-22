// // controllers/memberController.js
// import { pma } from "../models/pma.model.js";
// import { User } from "../models/user.model.js";
// //checked
// /**
//  * Get attendance records for a member
//  * Query params:
//  *  - startDate, endDate
//  *  - slot
//  *  - page, limit
//  *  - sortBy (date, slot), order (asc, desc)
//  * 
//  * req.user contains logged-in member
//  */
// export const getMemberAttendance = async (req, res) => {
//   try {
//     const memberId = req.params.userId; // from JWT middleware
//     // console.log(req.user);
    
//     const {
//       startDate,
//       endDate,
//       slot,
//       page = 1,
//       limit = 20,
//       sortBy = "date",
//       order = "desc"
//     } = req.query;

//     // Fetch member attendance log
//     const memberLog = await pma.findOne({ memberId });
    
//     const {name} = await User.findById(memberId);
//     if (!memberLog || !memberLog.records.length) {
//       return res.status(404).json({
//         username: name,
//         message: "No attendance records found."
//       });
//     }
//     // Filter by date
//     let filteredRecords = memberLog.records;
//     if (startDate) filteredRecords = filteredRecords.filter(r => new Date(r.date) >= new Date(startDate));
//     if (endDate) filteredRecords = filteredRecords.filter(r => new Date(r.date) <= new Date(endDate));

//     // Filter by slot
//     if (slot) filteredRecords = filteredRecords.filter(r => r.slot === slot || r.slot === `Slot ${slot}`);

//     // Sorting
//     filteredRecords.sort((a, b) => {
//       let fieldA = a[sortBy];
//       let fieldB = b[sortBy];
//       if (sortBy === "date") {
//         fieldA = new Date(a.date);
//         fieldB = new Date(b.date);
//       }
//       if (order === "asc") return fieldA > fieldB ? 1 : -1;
//       return fieldA < fieldB ? 1 : -1;
//     });

//     // Pagination
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + parseInt(limit);
//     const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

//     res.status(200).json({
//       username: name,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalRecords: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit),
//       records: paginatedRecords
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Server error while fetching member attendance." });
//   }
// };
// controllers/memberController.js
import { pma } from "../models/pma.model.js";
import { User } from "../models/user.model.js";

export const getMemberAttendance = async (req, res) => {
  try {
    const memberId = req.params.userId;

    const {
      startDate,
      endDate,
      slot,
      page = 1,
      limit = 20,
      sortBy = "date",
      order = "desc",
    } = req.query;

    // Fetch attendance and user
    const memberLog = await pma.findOne({ memberId });
    const { name } = await User.findById(memberId);

    if (!memberLog || !memberLog.records.length) {
      return res.status(404).json({
        username: name,
        message: "No attendance records found.",
      });
    }

    let filteredRecords = memberLog.records;

    // Apply filters
    if (startDate)
      filteredRecords = filteredRecords.filter(
        (r) => new Date(r.date) >= new Date(startDate)
      );
    if (endDate)
      filteredRecords = filteredRecords.filter(
        (r) => new Date(r.date) <= new Date(endDate)
      );
    if (slot)
      filteredRecords = filteredRecords.filter(
        (r) => r.slot === slot || r.slot === `Slot ${slot}`
      );

    // Sort records
    filteredRecords.sort((a, b) => {
      let fieldA = sortBy === "date" ? new Date(a.date) : a[sortBy];
      let fieldB = sortBy === "date" ? new Date(b.date) : b[sortBy];
      return order === "asc"
        ? fieldA > fieldB
          ? 1
          : -1
        : fieldA < fieldB
        ? 1
        : -1;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // --- 📊 Calculate last 3 months attendance stats ---
    const now = new Date();
    const past3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const recentRecords = memberLog.records.filter(
      (r) => new Date(r.date) >= past3Months
    );

    const monthlyCount = {}; // { '2025-08': 10, '2025-09': 12 }
    const weeklyCount = {}; // { '2025-W40': 4, '2025-W41': 3 }

    for (const rec of recentRecords) {
      const date = new Date(rec.date);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const weekKey = getISOWeekKey(date); // helper below

      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
      weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1;
    }

    res.status(200).json({
      username: name,
      page: parseInt(page),
      limit: parseInt(limit),
      totalRecords: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit),
      records: paginatedRecords,
      stats: {
        monthlyCount,
        weeklyCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching member attendance.",
    });
  }
};

// 👉 Helper to get ISO week format: "YYYY-WW"
function getISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}



export const getpMemberAttendance = async (req, res) => {
  try {
    const memberId = req.user.id;

    const {
      startDate,
      endDate,
      slot,
      page = 1,
      limit = 20,
      sortBy = "date",
      order = "desc",
    } = req.query;

    // Fetch attendance and user
    const memberLog = await pma.findOne({ memberId });
    const { name } = await User.findById(memberId);

    if (!memberLog || !memberLog.records.length) {
      return res.status(404).json({
        username: name,
        message: "No attendance records found.",
      });
    }

    let filteredRecords = memberLog.records;

    // Apply filters
    if (startDate)
      filteredRecords = filteredRecords.filter(
        (r) => new Date(r.date) >= new Date(startDate)
      );
    if (endDate)
      filteredRecords = filteredRecords.filter(
        (r) => new Date(r.date) <= new Date(endDate)
      );
    if (slot)
      filteredRecords = filteredRecords.filter(
        (r) => r.slot === slot || r.slot === `Slot ${slot}`
      );

    // Sort records
    filteredRecords.sort((a, b) => {
      let fieldA = sortBy === "date" ? new Date(a.date) : a[sortBy];
      let fieldB = sortBy === "date" ? new Date(b.date) : b[sortBy];
      return order === "asc"
        ? fieldA > fieldB
          ? 1
          : -1
        : fieldA < fieldB
        ? 1
        : -1;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // --- 📊 Calculate last 3 months attendance stats ---
    const now = new Date();
    const past3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const recentRecords = memberLog.records.filter(
      (r) => new Date(r.date) >= past3Months
    );

    const monthlyCount = {}; // { '2025-08': 10, '2025-09': 12 }
    const weeklyCount = {}; // { '2025-W40': 4, '2025-W41': 3 }

    for (const rec of recentRecords) {
      const date = new Date(rec.date);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const weekKey = getISOWeekKey(date); // helper below

      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
      weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1;
    }

    res.status(200).json({
      username: name,
      page: parseInt(page),
      limit: parseInt(limit),
      totalRecords: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit),
      records: paginatedRecords,
      stats: {
        monthlyCount,
        weeklyCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching member attendance.",
    });
  }
};

