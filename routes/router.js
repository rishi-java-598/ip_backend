// routes/router.js
import express from "express";

// Middleware
import { verifyToken } from "../middlewares/authmiddleware.js";
import { authorizeRoles } from "../middlewares/authroles.middleware.js";

// Controllers
import { login } from "../controllers/login.controller.js";
import { registerUser } from "../controllers/userRegReq.controller.js";

import { getDeleteUserRequests, requestDeleteMember } from "../controllers/delURequest.controller.js";
import { deleteMemberFromTodayAttendance, getTodayAttendance, markDailyAttendance, updateMemberSlot } from "../controllers/markAttendance.controller.js";
import { editAttendance } from "../controllers/editAttendance.controller.js";
import { editMembership } from "../controllers/editMembership.controller.js";
import { getAllUsers } from "../controllers/getAllUser.controller.js";

import { getAttendanceSummaryByDate } from "../controllers/getAttendanceSummaryByDate.controller.js";
import { getPreviousAttendance } from "../controllers/getPrevAttendance.controller.js";
import { getProfileDetails } from "../controllers/getProfileDetail.controller.js";
import { getAttendanceHistoryForMember } from "../controllers/getAttendanceHistoryForMember.controller.js";
import { getMemberAttendance, getpMemberAttendance } from "../controllers/getMemberAttendance.controller.js";
import { approveUserRegistration, rejectUserRegistration } from "../controllers/approveURR.controller.js";
import { approveUserDeletionRequest, getAllDeletionRequests, rejectUserDeletionRequest } from "../controllers/delByAdmin.controller.js";
import { addUser, deleteUser } from "../controllers/addU.controller.js";
import { updateUser } from "../controllers/updateUser.controller.js";

// Router init
const router = express.Router();

/* =====================C
   AUTH ROUTES 
===================== */
router.post("/auth/login", login);
router.post("/auth/register", registerUser);
router.post("/auth/add-user", verifyToken, authorizeRoles("admin", "manager"), addUser);
router.put("/auth/update-user/:id", verifyToken, authorizeRoles("admin", "manager"), updateUser);

// router.delete('/users/:id', deleteUser);

// deleting user:
router.delete('/delete/user/:id',verifyToken,authorizeRoles("admin"),deleteUser);

/* =====================C
   PROFILE ROUTES
===================== */
// Get own profile
router.get(
  "/profile",
  verifyToken,
  authorizeRoles("admin", "manager", "member"),
  getProfileDetails
);

router.put("/approve/:userId", approveUserRegistration);
router.delete("/reject/:userId", rejectUserRegistration);



// Get profile by ID (only admin & manager can view others)
router.get(
  "/profile/:id",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getProfileDetails
);
// Get all users with filters/search/sort
//=====================================C
router.get(
  "/users",
  verifyToken,
  authorizeRoles("admin","manager"),
  getAllUsers
);

/* =====================C
   MANAGER ROUTES
===================== */
// Request to delete a member
router.post(
  "/manager/delete-member-request",
  verifyToken,
  authorizeRoles("manager"),
  requestDeleteMember
);

router.get("/manager/get-member-delete-requests", verifyToken, authorizeRoles("manager","admin"), getDeleteUserRequests);


router.delete(
  "/admin/delete-member-request/:requestId",
  verifyToken,
  authorizeRoles("admin"),
  approveUserDeletionRequest
)
router.put(
  "/admin/reject-member-request/:requestId",
  verifyToken,
  authorizeRoles("admin"),
  rejectUserDeletionRequest
);

router.get(
  "/delete-member-requests",
  verifyToken,
  authorizeRoles("manager","admin"),
  getAllDeletionRequests
);

































// Mark daily attendance
router.post(
  "/manager/attendance/mark",
  verifyToken,
  authorizeRoles("manager", "admin"),
  markDailyAttendance
);

/* =====================C
   ADMIN ROUTES
===================== */
// Edit attendance
router.put(
  "/admin/attendance/edit",
  verifyToken,
  authorizeRoles("admin"),
  editAttendance
);

// Edit membership details
router.put(
  "/admin/membership/edit",
  verifyToken,
  authorizeRoles("admin", "manager"),
  editMembership
);



/* =====================
   ATTENDANCE ROUTES
===================== */
// Get previous attendance
router.get(
  "/attendance/previous",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getPreviousAttendance
);

// Get attendance summary for a date
router.get(
  "/attendance/summary",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getAttendanceSummaryByDate
);

// Get member’s own attendance
router.get(
  "/attendance/member/:userId/",
  verifyToken,
  // authorizeRoles("member"),
  getMemberAttendance
);

router.get(
  "/attendance/memberp/",
  verifyToken,
  // authorizeRoles("member"),
  getpMemberAttendance
);

// Get full attendance history for member
router.get(
  "/attendance/member/history",
  verifyToken,
  authorizeRoles("member"),
  getAttendanceHistoryForMember
);










//added
/**
 * @route POST /manager/attendance/mark
 * @desc Mark attendance for one or more members
 * @access Manager/Admin
 */
router.post(
  "/manager/attendance/mark",
  verifyToken,
  authorizeRoles("admin", "manager"),
  markDailyAttendance
);

/**
 * @route GET /attendance/today?date=YYYY-MM-DD
 * @desc Get attendance for a specific date
 * @access Manager/Admin
 */
router.get(
  "/attendance/today",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getTodayAttendance
);

/**
 * @route POST /attendance/today/delete
 * @desc Remove a member from today’s attendance
 * @access Manager/Admin
 */
router.post(
  "/attendance/today/delete",
  verifyToken,
  authorizeRoles("admin", "manager"),
  deleteMemberFromTodayAttendance
);

/**
 * @route POST /attendance/today/update-slot
 * @desc Update a member’s slot for today
 * @access Manager/Admin
 */
router.post(
  "/attendance/today/update-slot",
  verifyToken,
  authorizeRoles("admin", "manager"),
  updateMemberSlot
);

export { router };
