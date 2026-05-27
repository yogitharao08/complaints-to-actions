import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    description: String,
    zoneCoverage: [String],
    escalationLevel: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);
