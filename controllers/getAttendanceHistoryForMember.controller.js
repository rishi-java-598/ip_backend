// controllers/memberController.js
import { pma } from "../models/MemberAttendanceLog.js";

/**
 * Get full attendance history for a member
 * Also returns weekly & monthly attendance counts
 */
export const getAttendanceHistoryForMember = async (req, res) => {
  try {
    const memberId = req.user._id; // from JWT middleware
    const {
      startDate,
      endDate,
      slot,
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 20
    } = req.query;

    const memberLog = await pma.findOne({ memberId });

    if (!memberLog || memberLog.records.length === 0) {
      return res.status(404).json({ message: "No attendance history found." });
    }

    let records = memberLog.records;

    // Filter by date range
    if (startDate) records = records.filter(r => new Date(r.date) >= new Date(startDate));
    if (endDate) records = records.filter(r => new Date(r.date) <= new Date(endDate));

    // Filter by slot
    if (slot) records = records.filter(r => r.slot === Number(slot));

    // Sorting
    records.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedRecords = records.slice(startIndex, startIndex + parseInt(limit));

    // Weekly & Monthly counts
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const weeklyCount = memberLog.records.filter(r => new Date(r.date) >= sevenDaysAgo).length;
    const monthlyCount = memberLog.records.filter(r => new Date(r.date) >= thirtyDaysAgo).length;

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalRecords: records.length,
      totalPages: Math.ceil(records.length / limit),
      weeklyAttendance: weeklyCount,
      monthlyAttendance: monthlyCount,
      records: paginatedRecords
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching attendance history." });
  }
};
