import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, // Only one document per day

  // Slot can still be stored per member, but we track counts in a separate array
  presentMembers: [
    {
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      memberName: String,
      membershipType: String,
      // added for email change
      memberEmail : String,
      uniqueIdCard: String,
      slot: { type: Number, required: true } // Morning, Evening, Full Day, etc.
    }
  ],

  // Array of counts for 9 slots: index 0 → slot 1, index 1 → slot 2, ..., index 8 → slot 9
  slotCounts: {
    type: [Number],
    default: Array(9).fill(0)
  },

  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager/Admin who marked
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries by member
attendanceSchema.index({ "presentMembers.memberId": 1 });

// Compound unique index to ensure only one doc per day
attendanceSchema.index({ date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
