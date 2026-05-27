import express from "express";
import { isDbConnected } from "../lib/db.js";
import { getStoredComplaints } from "../lib/fileStore.js";
import { requireAuth } from "../middleware/auth.js";
import { Complaint } from "../models/Complaint.js";
import { Department } from "../models/Department.js";
import { demoDepartments } from "../seed/demoData.js";

const router = express.Router();

router.get("/overview", requireAuth, async (_req, res) => {
  const complaints = isDbConnected() ? await Complaint.find({}).lean() : getStoredComplaints();
  const departments = isDbConnected() ? await Department.find({}).lean() : demoDepartments;
  const total = complaints.length;
  const resolved = complaints.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
  const escalated = complaints.filter((item) => item.status === "Escalated").length;
  const reopened = complaints.reduce((sum, item) => sum + (item.reopenedCount || 0), 0);
  const byDepartment = departments.map((department) => {
    const departmentComplaints = complaints.filter((item) => item.departmentId === department._id);
    const closed = departmentComplaints.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
    return {
      name: department.name,
      total: departmentComplaints.length,
      resolved: closed,
      pending: departmentComplaints.length - closed,
      resolvedRate: departmentComplaints.length ? Math.round((closed / departmentComplaints.length) * 100) : 0
    };
  });
  const byStatus = ["Assigned", "In Progress", "Resolved", "Closed", "Reopened", "Escalated"].map((status) => ({
    status,
    count: complaints.filter((item) => item.status === status).length
  }));
  const byCategory = Object.values(complaints.reduce((acc, item) => {
    const key = item.category || "Uncategorized";
    acc[key] = acc[key] || { category: key, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {}));

  res.json({
    total,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    escalated,
    reopened,
    averageResponseHours: 6.8,
    byDepartment,
    byStatus,
    byCategory,
    hotspots: [
      { ward: "Ward 7", category: "Water leakage", count: 14 },
      { ward: "Ward 4", category: "Road damage", count: 11 },
      { ward: "Ward 8", category: "Illegal dumping", count: 9 }
    ]
  });
});

export default router;
