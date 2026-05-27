import bcrypt from "bcryptjs";
import express from "express";
import { isDbConnected } from "../lib/db.js";
import { getStoredUsers, saveStoredUsers } from "../lib/fileStore.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    departmentId: user.departmentId,
    zoneIds: user.zoneIds || [],
    isActive: user.isActive !== false,
    status: user.isActive === false ? "Disabled" : "Active"
  };
}

router.get("/", requireAuth, allowRoles("admin"), async (_req, res) => {
  const users = isDbConnected() ? await User.find({}).sort({ createdAt: -1 }).lean() : getStoredUsers();
  res.json(users.map(publicUser));
});

router.post("/", requireAuth, allowRoles("admin"), async (req, res) => {
  const { name, email, mobile, role, departmentId, password = "password" } = req.body;
  const normalizedEmail = String(email || "").toLowerCase();
  const idPrefix = role === "officer" ? "officer" : role === "admin" ? "admin" : "user";
  const user = {
    _id: `${idPrefix}-${Date.now()}`,
    name,
    email: normalizedEmail,
    mobile,
    role,
    departmentId: role === "officer" ? departmentId : undefined,
    zoneIds: [],
    isActive: true,
    passwordHash: await bcrypt.hash(password, 10)
  };

  if (isDbConnected()) {
    const created = await User.create(user);
    return res.status(201).json(publicUser(created));
  }

  const users = getStoredUsers();
  if (users.some((item) => item.email === normalizedEmail)) return res.status(409).json({ message: "Email already exists." });
  const stamped = { ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  saveStoredUsers([stamped, ...users]);
  res.status(201).json(publicUser(stamped));
});

router.patch("/:id", requireAuth, allowRoles("admin"), async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email ? String(req.body.email).toLowerCase() : undefined,
    mobile: req.body.mobile,
    role: req.body.role,
    departmentId: req.body.role === "officer" ? req.body.departmentId : undefined,
    isActive: req.body.isActive
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (isDbConnected()) {
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(publicUser(user));
  }

  const users = getStoredUsers();
  const index = users.findIndex((item) => item._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "User not found." });
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  saveStoredUsers(users);
  res.json(publicUser(users[index]));
});

router.patch("/:id/password", requireAuth, allowRoles("admin"), async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password || "password", 10);

  if (isDbConnected()) {
    const user = await User.findByIdAndUpdate(req.params.id, { passwordHash }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ ok: true });
  }

  const users = getStoredUsers();
  const index = users.findIndex((item) => item._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "User not found." });
  users[index].passwordHash = passwordHash;
  users[index].updatedAt = new Date().toISOString();
  saveStoredUsers(users);
  res.json({ ok: true });
});

export default router;
