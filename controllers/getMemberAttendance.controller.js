// controllers/memberController.js
import { pma } from "../models/pma.model.js";
//checked
/**
 * Get attendance records for a member
 * Query params:
 *  - startDate, endDate
 *  - slot
 *  - page, limit
 *  - sortBy (date, slot), order (asc, desc)
 * 
 * req.user contains logged-in member
 */
export const getMemberAttendance = async (req, res) => {
  try {
    const memberId = req.user.id; // from JWT middleware
    console.log(req.user);
    
    const {
      startDate,
      endDate,
      slot,
      page = 1,
      limit = 20,
      sortBy = "date",
      order = "desc"
    } = req.query;

    // Fetch member attendance log
    const memberLog = await pma.findOne({ memberId });
    if (!memberLog || !memberLog.records.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    // Filter by date
    let filteredRecords = memberLog.records;
    if (startDate) filteredRecords = filteredRecords.filter(r => new Date(r.date) >= new Date(startDate));
    if (endDate) filteredRecords = filteredRecords.filter(r => new Date(r.date) <= new Date(endDate));

    // Filter by slot
    if (slot) filteredRecords = filteredRecords.filter(r => r.slot === slot || r.slot === `Slot ${slot}`);

    // Sorting
    filteredRecords.sort((a, b) => {
      let fieldA = a[sortBy];
      let fieldB = b[sortBy];
      if (sortBy === "date") {
        fieldA = new Date(a.date);
        fieldB = new Date(b.date);
      }
      if (order === "asc") return fieldA > fieldB ? 1 : -1;
      return fieldA < fieldB ? 1 : -1;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalRecords: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit),
      records: paginatedRecords
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching member attendance." });
  }
};
