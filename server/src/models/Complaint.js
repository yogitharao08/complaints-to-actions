import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    _id: { type: String },
    complaintId: { type: String, required: true, unique: true },
    citizenId: String,
    createdByRole: { type: String, enum: ["citizen", "officer", "admin", "operator"], default: "citizen" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Citizen Verification", "Closed", "Reopened", "Escalated", "Rejected"],
      default: "Submitted"
    },
    departmentId: String,
    assignedOfficerId: String,
    locationText: String,
    landmark: String,
    geo: {
      lat: Number,
      lng: Number
    },
    mediaUrls: [String],
    proofUrls: [String],
    slaDueAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    reopenedCount: { type: Number, default: 0 },
    escalationCount: { type: Number, default: 0 },
    isAnonymous: { type: Boolean, default: false },
    rating: Number,
    feedbackText: String
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
