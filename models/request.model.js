import mongoose from "mongoose";

const deleteUserRequestSchema = new mongoose.Schema({
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User to delete
  action: { type: String, enum: ["deleteUser"], default: "deleteUser" }, // Only deleteUser action
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export const DeleteUserRequest = mongoose.model("DeleteUserRequest", deleteUserRequestSchema);
