import express from "express";
import { isDbConnected } from "../lib/db.js";
import { getStoredDepartments, saveStoredDepartments } from "../lib/fileStore.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Department } from "../models/Department.js";

const router = express.Router();

router.get("/", requireAuth, async (_req, res) => {
  res.json(isDbConnected() ? await Department.find({}).sort({ createdAt: -1 }).lean() : getStoredDepartments());
});

router.post("/", requireAuth, allowRoles("admin"), async (req, res) => {
  const payload = {
    _id: req.body._id || `dept-${Date.now()}`,
    name: req.body.name,
    description: req.body.description,
    zoneCoverage: Array.isArray(req.body.zoneCoverage) ? req.body.zoneCoverage : String(req.body.coverage || "").split(",").map((item) => item.trim()).filter(Boolean),
    active: req.body.active !== false
  };

  if (isDbConnected()) return res.status(201).json(await Department.create(payload));

  const departments = getStoredDepartments();
  const created = { ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  saveStoredDepartments([created, ...departments]);
  res.status(201).json(created);
});

router.patch("/:id", requireAuth, allowRoles("admin"), async (req, res) => {
  const updates = {
    name: req.body.name,
    description: req.body.description,
    zoneCoverage: Array.isArray(req.body.zoneCoverage) ? req.body.zoneCoverage : req.body.coverage ? String(req.body.coverage).split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    active: req.body.active
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (isDbConnected()) {
    const department = await Department.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!department) return res.status(404).json({ message: "Department not found." });
    return res.json(department);
  }

  const departments = getStoredDepartments();
  const index = departments.findIndex((item) => item._id === req.params.id || item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Department not found." });
  departments[index] = { ...departments[index], ...updates, updatedAt: new Date().toISOString() };
  saveStoredDepartments(departments);
  res.json(departments[index]);
});

export default router;
