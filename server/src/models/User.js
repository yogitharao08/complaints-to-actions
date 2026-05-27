import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: String,
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["citizen", "officer", "admin", "operator"], required: true },
    departmentId: String,
    zoneIds: [String],
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: true },
    emailOtpHash: String,
    emailOtpExpiresAt: Date,
    profileImage: String
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
