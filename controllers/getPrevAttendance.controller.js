// controllers/attendanceController.js
import { Attendance } from "../models/attendance.model.js";
//checked


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

    // Slot filter
    if (slot) {
      filters["presentMembers.slot"] = Number(slot);
    }

    // Member filters
    if (memberName || memberId || membershipType) {
      filters.presentMembers = { $elemMatch: {} };
      if (memberName)
        filters.presentMembers.$elemMatch.memberName = { $regex: memberName, $options: "i" };

      if (memberId) {
        // Convert to ObjectId if valid
        if (mongoose.isValidObjectId(memberId)) {
          filters.presentMembers.$elemMatch.memberId = new mongoose.Types.ObjectId(memberId);
        } else {
          return res.status(400).json({ message: "Invalid memberId format." });
        }
      }

      if (membershipType)
        filters.presentMembers.$elemMatch.membershipType = { $regex: membershipType, $options: "i" };
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query
    // const tempAttendance = await Attendance.find();
    // console.log(tempAttendance[0].presentMembers[0].memberId);
    

    const attendanceData = await Attendance.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      // .populate({
      //   path: "presentMembers.memberId",
      //   select: "name email",
      //   model: "User"
      // })
      // .populate("markedBy", "name email")
      // .lean(); 
  

    // If still null, it means no matching User exists for that ID
    const total = await Attendance.countDocuments(filters);


    console.log({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: attendanceData
    });
    

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: attendanceData
    });

  } catch (error) {
    console.error("Error fetching previous attendance:", error);
    res.status(500).json({ message: "Server error while fetching attendance." });
  }
};
