// controllers/adminController.js
import { User } from "../models/user.model.js";

/**
 * Get all users with filtering, searching, sorting, and pagination
 * Query params:
 *  - role (admin/manager/member)
 *  - status (registered/pending)
 *  - membershipType (Gold/Silver/Platinum)
 *  - membershipStatus (active/inactive)
 *  - search (name/email/phone/uniqueIdCard)
 *  - sortBy (field), order (asc/desc)
 *  - page, limit
 */
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      membershipType,
      membershipStatus,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};

    if (role) filters.role = role;
    if (status) filters.status = status;
    if (membershipType) filters["membership.type"] = membershipType;
    if (membershipStatus) filters["membership.status"] = membershipStatus;

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      filters.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { uniqueIdCard: regex }
      ];
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password"); // exclude password

    const total = await User.countDocuments(filters);

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      users
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};
