// controllers/attendanceController.js
import { Attendance } from "../models/attendance.model.js";

/**
 * Get previous attendance data with filtering, sorting, pagination
 * Query params:
 *  - startDate, endDate
 *  - slot
 *  - memberName
 *  - memberId
 *  - membershipType
 *  - page, limit
 *  - sortBy (date, slot), order (asc, desc)
 */
export const getPreviousAttendance = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      slot,
      memberName,
      memberId,
      membershipType,
      page = 1,
      limit = 20,
      sortBy = "date",
      order = "desc"
    } = req.query;

    const filters = {};

    // Date filter
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Slot filter (matches presentMembers.slot)
    if (slot) {
      filters["presentMembers.slot"] = Number(slot);
    }

    // Member-specific filters inside presentMembers
    if (memberName || memberId || membershipType) {
      filters.presentMembers = { $elemMatch: {} };
      if (memberName) filters.presentMembers.$elemMatch.memberName = { $regex: memberName, $options: "i" };
      if (memberId) filters.presentMembers.$elemMatch.memberId = memberId;
      if (membershipType) filters.presentMembers.$elemMatch.membershipType = { $regex: membershipType, $options: "i" };
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendanceData = await Attendance.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("presentMembers.memberId", "name email") // optional: fetch member basic info
      .populate("markedBy", "name email");

    const total = await Attendance.countDocuments(filters);

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: attendanceData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching attendance." });
  }
};
