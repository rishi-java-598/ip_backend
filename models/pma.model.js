import mongoose from "mongoose";
const memberAttendanceLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  memberEmail: { type: String, required: true }, // added for email change
  memberName: { type: String, required: true }, // added for name change
  records: [
    {
      date: { type: Date, required: true },
      slot: { type: String, required: true }
    }
  ]
});

memberAttendanceLogSchema.index({ memberId: 1 });
memberAttendanceLogSchema.index({ "records.date": 1 });

export const pma = mongoose.model("MemberAttendanceLog", memberAttendanceLogSchema);
