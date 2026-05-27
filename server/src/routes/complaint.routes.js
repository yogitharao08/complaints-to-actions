import express from "express";
import { isDbConnected } from "../lib/db.js";
import { getStoredComplaints, getStoredStatusLogs, saveStoredComplaints, saveStoredStatusLogs } from "../lib/fileStore.js";
import { requireAuth } from "../middleware/auth.js";
import { Complaint } from "../models/Complaint.js";
import { Notification } from "../models/Notification.js";
import { StatusLog } from "../models/StatusLog.js";
import { User } from "../models/User.js";
import { nextComplaintId } from "../seed/demoData.js";

const router = express.Router();

const categoryRouting = [
  { match: ["road", "pothole", "public roads"], departmentId: "dept-roads", officerId: "officer-roads" },
  { match: ["water", "leak"], departmentId: "dept-water", officerId: "officer-water" },
  { match: ["garbage", "sanitation", "dumping", "drainage"], departmentId: "dept-sanitation", officerId: "officer-sanitation" },
  { match: ["electricity", "streetlight", "light"], departmentId: "dept-electricity", officerId: "officer-electricity" }
];

const defaultOfficerByDepartment = {
  "dept-roads": "officer-roads",
  "dept-water": "officer-water",
  "dept-sanitation": "officer-sanitation",
  "dept-electricity": "officer-electricity"
};

function routeComplaint(category = "") {
  const normalized = category.toLowerCase();
  return categoryRouting.find((route) => route.match.some((term) => normalized.includes(term))) || {};
}

function slaHours(category = "", severity = "medium") {
  const normalized = category.toLowerCase();
  const base = normalized.includes("water") || normalized.includes("leak")
    ? 12
    : normalized.includes("garbage") || normalized.includes("sanitation") || normalized.includes("dumping")
      ? 24
      : normalized.includes("streetlight") || normalized.includes("electricity") || normalized.includes("light")
        ? 48
        : 72;
  if (severity === "critical") return Math.max(6, Math.floor(base / 2));
  if (severity === "high") return Math.max(8, Math.floor(base * 0.75));
  return base;
}

function normalizeComplaintRouting(records) {
  let changed = false;
  const normalized = records.map((item) => {
    const routing = routeComplaint(item.category);
    const departmentId = item.departmentId || routing.departmentId;
    const assignedOfficerId = item.assignedOfficerId || defaultOfficerByDepartment[departmentId] || routing.officerId;
    const status = item.status === "Submitted" && departmentId ? "Assigned" : item.status;

    if (departmentId !== item.departmentId || assignedOfficerId !== item.assignedOfficerId || status !== item.status) changed = true;
    return { ...item, departmentId, assignedOfficerId, status };
  });

  if (changed) saveStoredComplaints(normalized);
  return normalized;
}

function visibleComplaints(user, records) {
  if (user.role === "admin" || user.role === "operator") return records;
  if (user.role === "officer") {
    return records.filter((item) => item.assignedOfficerId === user._id || item.departmentId === user.departmentId);
  }
  return records.filter((item) => item.citizenId === user._id);
}

async function createNotification(userId, complaintId, type, title, message) {
  if (!isDbConnected() || !userId) return;
  await Notification.create({
    _id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    complaintId,
    type,
    title,
    message
  });
}

async function notifyAdmins(complaintId, type, title, message) {
  if (!isDbConnected()) return;
  const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
  await Promise.all(admins.map((admin) => createNotification(admin._id, complaintId, type, title, message)));
}

router.get("/", requireAuth, async (req, res) => {
  const { status, category, search } = req.query;
  const records = isDbConnected()
    ? visibleComplaints(req.user, await Complaint.find({}).sort({ createdAt: -1 }).lean())
    : visibleComplaints(req.user, normalizeComplaintRouting(getStoredComplaints()));

  const filtered = records.filter((item) => {
    if (status && item.status !== status) return false;
    if (category && item.category !== category) return false;
    if (search && !`${item.complaintId} ${item.title} ${item.locationText}`.toLowerCase().includes(String(search).toLowerCase())) return false;
    return true;
  });

  res.json(filtered);
});

router.post("/", requireAuth, async (req, res) => {
  const routing = routeComplaint(req.body.category);
  const storedComplaints = getStoredComplaints();
  const complaintCount = isDbConnected() ? await Complaint.countDocuments() : storedComplaints.length;
  const payload = {
    ...req.body,
    _id: `cmp-${Date.now()}`,
    complaintId: nextComplaintId(complaintCount + 1),
    citizenId: req.user._id,
    createdByRole: req.user.role,
    status: "Assigned",
    departmentId: req.body.departmentId || routing.departmentId,
    assignedOfficerId: req.body.assignedOfficerId || routing.officerId,
    slaDueAt: new Date(Date.now() + slaHours(req.body.category, req.body.severity) * 60 * 60 * 1000)
  };

  if (isDbConnected()) {
    const complaint = await Complaint.create(payload);
    await StatusLog.create({ complaintId: complaint._id, newStatus: "Submitted", changedByUserId: req.user._id, changedByRole: req.user.role, comment: "Complaint filed." });
    await createNotification(complaint.assignedOfficerId, complaint._id, "assignment", "New complaint assigned", `${complaint.complaintId} was routed to your department.`);
    await notifyAdmins(complaint._id, "complaint", "New complaint filed", `${complaint.complaintId} was filed under ${complaint.category}.`);
    return res.status(201).json(complaint);
  }

  const complaint = { ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const statusLogs = getStoredStatusLogs();
  saveStoredComplaints([complaint, ...storedComplaints]);
  saveStoredStatusLogs([
    ...statusLogs,
    { complaintId: complaint._id, newStatus: "Submitted", changedByRole: req.user.role, comment: "Complaint filed.", createdAt: complaint.createdAt },
    { complaintId: complaint._id, previousStatus: "Submitted", newStatus: "Assigned", changedByRole: "system", comment: "Automatically routed to concerned department officer.", createdAt: complaint.createdAt }
  ]);
  res.status(201).json(complaint);
});

router.patch("/:id/assign", requireAuth, async (req, res) => {
  const { departmentId, assignedOfficerId, comment } = req.body;

  if (isDbConnected()) {
    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { complaintId: req.params.id }] },
      { departmentId, assignedOfficerId, status: "Assigned" },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    await StatusLog.create({ complaintId: complaint._id, previousStatus: complaint.status, newStatus: "Assigned", changedByUserId: req.user._id, changedByRole: req.user.role, comment: comment || "Admin reassigned complaint." });
    await createNotification(complaint.assignedOfficerId, complaint._id, "assignment", "Complaint reassigned", `${complaint.complaintId} was assigned to you.`);
    return res.json(complaint);
  }

  const storedComplaints = getStoredComplaints();
  const complaint = storedComplaints.find((item) => item._id === req.params.id || item.complaintId === req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const previousStatus = complaint.status;
  complaint.departmentId = departmentId;
  complaint.assignedOfficerId = assignedOfficerId || defaultOfficerByDepartment[departmentId];
  complaint.status = "Assigned";
  complaint.updatedAt = new Date().toISOString();
  const statusLogs = getStoredStatusLogs();
  saveStoredComplaints(storedComplaints);
  saveStoredStatusLogs([...statusLogs, { complaintId: complaint._id, previousStatus, newStatus: "Assigned", changedByRole: req.user.role, comment: comment || "Admin reassigned complaint.", createdAt: complaint.updatedAt }]);
  res.json(complaint);
});

router.get("/:id", requireAuth, async (req, res) => {
  const complaint = isDbConnected()
    ? visibleComplaints(req.user, await Complaint.find({ $or: [{ _id: req.params.id }, { complaintId: req.params.id }] }).lean())[0]
    : visibleComplaints(req.user, normalizeComplaintRouting(getStoredComplaints())).find((item) => item._id === req.params.id || item.complaintId === req.params.id);

  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const timeline = isDbConnected()
    ? await StatusLog.find({ complaintId: complaint._id }).sort({ createdAt: 1 }).lean()
    : getStoredStatusLogs().filter((item) => item.complaintId === complaint._id);

  res.json({ ...complaint, timeline });
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status, comment, proofUrls = [] } = req.body;

  if (isDbConnected()) {
    const complaint = await Complaint.findOne({ $or: [{ _id: req.params.id }, { complaintId: req.params.id }] });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.proofUrls.push(...proofUrls);
    if (status === "Resolved") complaint.resolvedAt = new Date();
    if (status === "Closed") complaint.closedAt = new Date();
    if (status === "Escalated") complaint.escalationCount += 1;
    await complaint.save();
    await StatusLog.create({ complaintId: complaint._id, previousStatus, newStatus: status, changedByUserId: req.user._id, changedByRole: req.user.role, comment, attachments: proofUrls });
    if (complaint.citizenId) {
      await createNotification(complaint.citizenId, complaint._id, "status", `Complaint ${status}`, `${complaint.complaintId} is now ${status}.`);
    }
    if (status === "Escalated") {
      await notifyAdmins(complaint._id, "escalation", "Complaint escalated", `${complaint.complaintId} needs admin attention.`);
    }
    return res.json(complaint);
  }

  const storedComplaints = getStoredComplaints();
  const complaint = storedComplaints.find((item) => item._id === req.params.id || item.complaintId === req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const previousStatus = complaint.status;
  complaint.status = status;
  complaint.proofUrls = [...(complaint.proofUrls || []), ...proofUrls];
  complaint.updatedAt = new Date().toISOString();
  if (status === "Escalated") complaint.escalationCount += 1;
  const statusLogs = getStoredStatusLogs();
  saveStoredComplaints(storedComplaints);
  saveStoredStatusLogs([...statusLogs, { complaintId: complaint._id, previousStatus, newStatus: status, changedByRole: req.user.role, comment, attachments: proofUrls, createdAt: complaint.updatedAt }]);
  res.json(complaint);
});

router.post("/:id/reopen", requireAuth, async (req, res) => {
  if (isDbConnected()) {
    const complaint = await Complaint.findOne({ $or: [{ _id: req.params.id }, { complaintId: req.params.id }] });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const previousStatus = complaint.status;
    complaint.status = "Reopened";
    complaint.reopenedCount += 1;
    await complaint.save();
    await StatusLog.create({
      complaintId: complaint._id,
      previousStatus,
      newStatus: "Reopened",
      changedByUserId: req.user._id,
      changedByRole: req.user.role,
      comment: req.body.reason || "Citizen requested reopening.",
      attachments: req.body.attachmentUrls || []
    });
    await createNotification(complaint.assignedOfficerId, complaint._id, "reopen", "Complaint reopened", `${complaint.complaintId} was reopened by the citizen.`);
    await notifyAdmins(complaint._id, "reopen", "Complaint reopened", `${complaint.complaintId} was reopened by the citizen.`);
    return res.json(complaint);
  }

  const storedComplaints = getStoredComplaints();
  const complaint = storedComplaints.find((item) => item._id === req.params.id || item.complaintId === req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const previousStatus = complaint.status;
  complaint.status = "Reopened";
  complaint.reopenedCount = (complaint.reopenedCount || 0) + 1;
  complaint.updatedAt = new Date().toISOString();
  const statusLogs = getStoredStatusLogs();
  saveStoredComplaints(storedComplaints);
  saveStoredStatusLogs([...statusLogs, {
    complaintId: complaint._id,
    previousStatus,
    newStatus: "Reopened",
    changedByRole: req.user.role,
    comment: req.body.reason || "Citizen requested reopening.",
    attachments: req.body.attachmentUrls || [],
    createdAt: complaint.updatedAt
  }]);
  res.json(complaint);
});

router.post("/:id/feedback", requireAuth, async (req, res) => {
  const storedComplaints = getStoredComplaints();
  const complaint = storedComplaints.find((item) => item._id === req.params.id || item.complaintId === req.params.id);
  if (!complaint || isDbConnected()) {
    const updated = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { complaintId: req.params.id }] },
      { rating: req.body.rating, feedbackText: req.body.feedbackText },
      { new: true }
    );
    return res.json(updated);
  }
  complaint.rating = req.body.rating;
  complaint.feedbackText = req.body.feedbackText;
  saveStoredComplaints(storedComplaints);
  res.json(complaint);
});

export default router;
