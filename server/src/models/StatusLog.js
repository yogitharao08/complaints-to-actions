import mongoose from "mongoose";

const statusLogSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true },
    previousStatus: String,
    newStatus: { type: String, required: true },
    changedByUserId: String,
    changedByRole: String,
    comment: String,
    attachments: [String]
  },
  { timestamps: true }
);

export const StatusLog = mongoose.model("StatusLog", statusLogSchema);
