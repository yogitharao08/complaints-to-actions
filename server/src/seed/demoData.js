import bcrypt from "bcryptjs";

export const demoDepartments = [
  { _id: "dept-roads", name: "Public Roads", description: "Potholes, road damage, sidewalks", zoneCoverage: ["Ward 1", "Ward 4"], escalationLevel: 2, active: true },
  { _id: "dept-water", name: "Water Supply", description: "Leaks, pressure and water quality", zoneCoverage: ["Ward 2", "Ward 7"], escalationLevel: 3, active: true },
  { _id: "dept-sanitation", name: "Sanitation & Waste", description: "Garbage, drainage and street cleaning", zoneCoverage: ["Ward 3", "Ward 8"], escalationLevel: 2, active: true },
  { _id: "dept-electricity", name: "Electricity Grid", description: "Street lights and electrical outages", zoneCoverage: ["Ward 5", "Ward 12"], escalationLevel: 2, active: true }
];

export const demoUsers = [
  { _id: "user-citizen", name: "James Walker", email: "citizen@cta.test", mobile: "9876543210", passwordHash: bcrypt.hashSync("password", 10), role: "citizen", zoneIds: ["Ward 4"], isActive: true },
  { _id: "officer-roads", name: "Roads Officer", email: "roads@cta.test", mobile: "9876543211", passwordHash: bcrypt.hashSync("password", 10), role: "officer", departmentId: "dept-roads", zoneIds: ["Ward 4"], isActive: true },
  { _id: "officer-water", name: "Water Officer", email: "water@cta.test", mobile: "9876543213", passwordHash: bcrypt.hashSync("password", 10), role: "officer", departmentId: "dept-water", zoneIds: ["Ward 7"], isActive: true },
  { _id: "officer-sanitation", name: "Sanitation Officer", email: "sanitation@cta.test", mobile: "9876543214", passwordHash: bcrypt.hashSync("password", 10), role: "officer", departmentId: "dept-sanitation", zoneIds: ["Ward 8"], isActive: true },
  { _id: "officer-electricity", name: "Electricity Officer", email: "electricity@cta.test", mobile: "9876543215", passwordHash: bcrypt.hashSync("password", 10), role: "officer", departmentId: "dept-electricity", zoneIds: ["Ward 12"], isActive: true },
  { _id: "user-admin", name: "Admin User", email: "admin@cta.test", mobile: "9876543212", passwordHash: bcrypt.hashSync("password", 10), role: "admin", zoneIds: ["all"], isActive: true }
];

export const demoComplaints = [
  {
    _id: "cmp-8842",
    complaintId: "CTA-2026-000123",
    citizenId: "user-citizen",
    createdByRole: "citizen",
    title: "Large pothole forming at intersection of 5th and Main",
    description: "A deep pothole is widening near the school crossing and vehicles are swerving into the opposite lane.",
    category: "Road damage / potholes",
    subcategory: "Pothole",
    severity: "high",
    status: "In Progress",
    departmentId: "dept-roads",
    assignedOfficerId: "officer-roads",
    locationText: "5th and Main, Ward 4",
    landmark: "Near public school gate",
    slaDueAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
    reopenedCount: 0,
    escalationCount: 0,
    createdAt: "2026-05-19T09:15:00.000Z",
    updatedAt: "2026-05-20T07:30:00.000Z"
  },
  {
    _id: "cmp-7510",
    complaintId: "CTA-2026-000124",
    citizenId: "user-citizen",
    title: "Street light outage beside old town bridge",
    description: "Three consecutive street lights are out, making the bridge approach unsafe after dark.",
    category: "Streetlight issue",
    subcategory: "Outage",
    severity: "medium",
    status: "Resolved",
    departmentId: "dept-electricity",
    assignedOfficerId: "officer-electricity",
    locationText: "Old Town Bridge, Ward 12",
    proofUrls: ["before-after-light-repair.jpg"],
    resolvedAt: "2026-05-18T15:20:00.000Z",
    slaDueAt: "2026-05-19T09:00:00.000Z",
    rating: 4,
    feedbackText: "Resolved on time.",
    reopenedCount: 0,
    escalationCount: 0,
    createdAt: "2026-05-17T09:00:00.000Z",
    updatedAt: "2026-05-18T15:20:00.000Z"
  },
  {
    _id: "cmp-9122",
    complaintId: "CTA-2026-000125",
    citizenId: "user-citizen",
    title: "Illegal garbage dumping in market square",
    description: "Waste is being dumped overnight near the vegetable market entrance.",
    category: "Illegal dumping",
    severity: "medium",
    status: "Assigned",
    departmentId: "dept-sanitation",
    assignedOfficerId: "officer-sanitation",
    locationText: "Market Square East, Ward 8",
    slaDueAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    reopenedCount: 0,
    escalationCount: 0,
    createdAt: "2026-05-20T05:40:00.000Z",
    updatedAt: "2026-05-20T05:40:00.000Z"
  },
  {
    _id: "cmp-6621",
    complaintId: "CTA-2026-000126",
    citizenId: "user-citizen",
    title: "Water leakage flooding block G",
    description: "Water has been leaking for two days and is pooling near residential entrances.",
    category: "Water leakage",
    severity: "critical",
    status: "Escalated",
    departmentId: "dept-water",
    assignedOfficerId: "officer-water",
    locationText: "North Sector, Block G, Ward 7",
    slaDueAt: "2026-05-19T12:00:00.000Z",
    reopenedCount: 1,
    escalationCount: 2,
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-20T06:15:00.000Z"
  }
];

export const demoStatusLogs = [
  { complaintId: "cmp-8842", previousStatus: null, newStatus: "Submitted", changedByRole: "citizen", comment: "Complaint filed with image evidence.", createdAt: "2026-05-19T09:15:00.000Z" },
  { complaintId: "cmp-8842", previousStatus: "Submitted", newStatus: "Assigned", changedByRole: "admin", comment: "Routed to Public Roads based on category and ward.", createdAt: "2026-05-19T13:45:00.000Z" },
  { complaintId: "cmp-8842", previousStatus: "Assigned", newStatus: "In Progress", changedByRole: "officer", comment: "Field verification started.", createdAt: "2026-05-20T07:30:00.000Z" }
];

export const demoNotifications = [
  { _id: "note-1", userId: "user-citizen", complaintId: "cmp-8842", type: "status", title: "Complaint in progress", message: "Public Roads has started field verification.", isRead: false, createdAt: "2026-05-20T07:30:00.000Z" },
  { _id: "note-2", userId: "officer-roads", complaintId: "cmp-8842", type: "assignment", title: "Road complaint assigned", message: "CTA-2026-000123 is assigned to Public Roads for field verification.", isRead: false, createdAt: "2026-05-19T13:45:00.000Z" },
  { _id: "note-3", userId: "officer-water", complaintId: "cmp-6621", type: "escalation", title: "Critical leak escalated", message: "CTA-2026-000126 has crossed SLA and needs an urgent water officer update.", isRead: false, createdAt: "2026-05-20T06:15:00.000Z" },
  { _id: "note-4", userId: "officer-sanitation", complaintId: "cmp-9122", type: "assignment", title: "Sanitation complaint assigned", message: "CTA-2026-000125 is waiting in your sanitation queue.", isRead: false, createdAt: "2026-05-20T05:40:00.000Z" },
  { _id: "note-5", userId: "officer-electricity", complaintId: "cmp-7510", type: "resolved", title: "Streetlight proof uploaded", message: "CTA-2026-000124 was resolved with repair proof attached.", isRead: true, createdAt: "2026-05-18T15:20:00.000Z" },
  { _id: "note-6", userId: "user-admin", complaintId: "cmp-6621", type: "escalation", title: "SLA breach", message: "Critical water leakage has crossed SLA and was escalated.", isRead: false, createdAt: "2026-05-20T06:15:00.000Z" }
];

export function nextComplaintId(count) {
  return `CTA-2026-${String(count + 123).padStart(6, "0")}`;
}
