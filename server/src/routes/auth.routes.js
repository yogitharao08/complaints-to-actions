import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { isDbConnected } from "../lib/db.js";
import { getStoredUsers, saveStoredUsers } from "../lib/fileStore.js";
import { sendRegistrationOtp } from "../lib/mailer.js";
import { User } from "../models/User.js";

const router = express.Router();

function issueAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "10m" });
}

function issueRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret", { expiresIn: "3d" });
}

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    address: user.address,
    role: user.role,
    departmentId: user.departmentId
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const normalized = String(identifier || "").toLowerCase();

  const user = isDbConnected()
    ? await User.findOne({ $or: [{ email: normalized }, { mobile: identifier }] })
    : getStoredUsers().find((item) => item.email === normalized || item.mobile === identifier);

  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (user.role === "citizen" && user.emailVerified === false) {
    return res.status(403).json({ message: "Please verify your email before logging in" });
  }
  if (user.isActive === false) return res.status(403).json({ message: "Account is disabled" });

  res.cookie("cta_refresh_token", issueRefreshToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
  });

  res.json({
    accessToken: issueAccessToken(user),
    user: publicUser(user)
  });
});

router.post("/register", async (req, res) => {
  const { name, email, mobile, address, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const otp = createOtp();
  const emailOtpHash = hashOtp(otp);
  const emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (!isDbConnected()) {
    const users = getStoredUsers();
    const existing = users.find((item) => item.email === normalizedEmail);
    if (existing && existing.emailVerified !== false) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const user = {
      ...(existing || {}),
      _id: existing?._id || `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      mobile,
      address,
      role: "citizen",
      zoneIds: [],
      isActive: false,
      emailVerified: false,
      emailOtpHash,
      emailOtpExpiresAt: emailOtpExpiresAt.toISOString(),
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const nextUsers = existing ? users.map((item) => item.email === normalizedEmail ? user : item) : [...users, user];
    const emailInfo = await sendRegistrationOtp(normalizedEmail, otp);
    saveStoredUsers(nextUsers);
    return res.status(202).json({
      message: "Verification OTP sent to your email",
      email: normalizedEmail,
      previewUrl: process.env.NODE_ENV === "production" ? undefined : emailInfo.previewUrl
    });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing && existing.emailVerified !== false) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const update = {
    name,
    email: normalizedEmail,
    mobile,
    address,
    role: "citizen",
    zoneIds: [],
    isActive: false,
    emailVerified: false,
    emailOtpHash,
    emailOtpExpiresAt,
    passwordHash: await bcrypt.hash(password, 10)
  };

  if (existing) {
    await User.updateOne({ _id: existing._id }, update);
  } else {
    await User.create({ _id: `user-${Date.now()}`, ...update });
  }

  const emailInfo = await sendRegistrationOtp(normalizedEmail, otp);
  res.status(202).json({
    message: "Verification OTP sent to your email",
    email: normalizedEmail,
    previewUrl: process.env.NODE_ENV === "production" ? undefined : emailInfo.previewUrl
  });
});

router.post("/register/verify", async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  if (!isDbConnected()) {
    const users = getStoredUsers();
    const user = users.find((item) => item.email === normalizedEmail);
    if (!user || user.emailVerified !== false) return res.status(400).json({ message: "No pending verification found" });
    if (!user.emailOtpExpiresAt || new Date(user.emailOtpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please register again to receive a new OTP" });
    }
    if (user.emailOtpHash !== hashOtp(String(otp))) return res.status(400).json({ message: "Invalid OTP" });

    const verifiedUser = {
      ...user,
      isActive: true,
      emailVerified: true,
      emailOtpHash: undefined,
      emailOtpExpiresAt: undefined,
      updatedAt: new Date().toISOString()
    };
    saveStoredUsers(users.map((item) => item.email === normalizedEmail ? verifiedUser : item));
    res.cookie("cta_refresh_token", issueRefreshToken(verifiedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    });
    return res.status(201).json({ accessToken: issueAccessToken(verifiedUser), user: publicUser(verifiedUser) });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.emailVerified !== false) return res.status(400).json({ message: "No pending verification found" });
  if (!user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: "OTP has expired. Please register again to receive a new OTP" });
  }
  if (user.emailOtpHash !== hashOtp(String(otp))) return res.status(400).json({ message: "Invalid OTP" });

  user.isActive = true;
  user.emailVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpiresAt = undefined;
  await user.save();

  res.cookie("cta_refresh_token", issueRefreshToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
  });
  res.status(201).json({ accessToken: issueAccessToken(user), user: publicUser(user) });
});

router.post("/refresh", async (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, val] = cookie.trim().split("=");
    if (key) acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
  const refreshToken = cookies["cta_refresh_token"];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "dev-refresh-secret");
    const user = isDbConnected()
      ? await User.findById(payload.sub)
      : getStoredUsers().find((item) => item._id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const accessToken = issueAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("cta_refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth"
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
