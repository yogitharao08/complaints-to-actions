import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true },
    complaintId: String,
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
