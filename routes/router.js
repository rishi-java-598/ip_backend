// const { login } = require("../controllers/authController");
// const verifyToken = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/roleMiddleware");
// const Attendance = require("../models/Attendance");
import express from "express";
import { login } from "../controllers/login.controller.js";
import { verifyToken } from "../utils/token.util.js";
import { authorizeRoles } from "../middlewares/authroles.middleware.js";
import { Attendance } from "../models/attendance.model.js";



const router = express.Router();

// Login route
router.post("/login", login);

// Example protected route: only admins can view attendance
router.get("/attendance", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const data = await Attendance.find().populate("presentMembers.memberId", "name email");
  res.json(data);
});

// Example protected route: manager or admin can mark attendance
router.post("/attendance/mark", verifyToken, authorizeRoles("admin", "manager"), async (req, res) => {
  // Attendance marking logic here
  res.json({ message: "Attendance marked" });
});

export {router};
