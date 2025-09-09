// routes/router.js
import express from "express";

// Middleware
import { verifyToken } from "../middlewares/authmiddleware.js";
import { authorizeRoles } from "../middlewares/authroles.middleware.js";

// Controllers
import { login } from "../controllers/login.controller.js";
import { registerUser } from "../controllers/userRegReq.controller.js";

import { requestDeleteMember } from "../controllers/delURequest.controller.js";
import { markDailyAttendance } from "../controllers/markAttendance.controller.js";
import { editAttendance } from "../controllers/editAttendance.controller.js";
import { editMembership } from "../controllers/editMembership.controller.js";
import { getAllUsers } from "../controllers/getAllUser.controller.js";

import { getAttendanceSummaryByDate } from "../controllers/getAttendanceSummaryByDate.controller.js";
import { getPreviousAttendance } from "../controllers/getPrevAttendance.controller.js";
import { getProfileDetails } from "../controllers/getProfileDetail.controller.js";
import { getAttendanceHistoryForMember } from "../controllers/getAttendanceHistoryForMember.controller.js";
import { getMemberAttendance } from "../controllers/getMemberAttendance.controller.js";
import { approveUserRegistration } from "../controllers/approveURR.controller.js";
import { approveUserDeletionRequest, getAllDeletionRequests } from "../controllers/delByAdmin.controller.js";
import { addUser } from "../controllers/addU.controller.js";

// Router init
const router = express.Router();

/* =====================C
   AUTH ROUTES 
===================== */
router.post("/auth/login", login);
router.post("/auth/register", registerUser);
router.post("/auth/add-user", verifyToken, authorizeRoles("admin", "manager"), addUser);

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


router.delete(
  "/admin/delete-member-request/:requestId",
  verifyToken,
  authorizeRoles("admin"),
  approveUserDeletionRequest
)

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
  "/attendance/member",
  verifyToken,
  authorizeRoles("member"),
  getMemberAttendance
);

// Get full attendance history for member
router.get(
  "/attendance/member/history",
  verifyToken,
  authorizeRoles("member"),
  getAttendanceHistoryForMember
);

export { router };
