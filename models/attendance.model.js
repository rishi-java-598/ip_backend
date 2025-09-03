import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Attendance date
  slot: { type: String, required: true }, // Morning, Evening, Full Day

  presentMembers: [
    {
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      memberName: String,
      membershipType: String,
      uniqueIdCard: String
    }
  ],

  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager/Admin who marked
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries by member
attendanceSchema.index({ date: 1, "presentMembers.memberId": 1 });

export const Attendance= mongoose.model("Attendance", attendanceSchema);
