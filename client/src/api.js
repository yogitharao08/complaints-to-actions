import axios from "axios";
import { complaints as seedComplaints, departments as seedDepartments } from "./demoData.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cta_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(identifier, password, role) {
  const demoPassword = localStorage.getItem(`cta_demo_password_${String(identifier).toLowerCase()}`);
  if (demoPassword) {
    if (demoPassword !== password) throw new Error("Invalid credentials");
    const demoUser = { id: `demo-${role}`, name: role === "admin" ? "Admin User" : role === "officer" ? "Officer User" : "Citizen User", email: identifier, role };
    localStorage.setItem("cta_user", JSON.stringify(demoUser));
    localStorage.setItem("cta_token", `demo-${role}`);
    return demoUser;
  }

  const { data } = await api.post("/auth/login", { identifier, password, role });
  localStorage.setItem("cta_token", data.token);
  localStorage.setItem("cta_user", JSON.stringify(data.user));
  return data.user;
}

export async function registerLocalAccount(payload) {
  const { data } = await api.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    password: payload.password
  });
  return data;
}

export async function verifyCitizenRegistration(email, otp) {
  const { data } = await api.post("/auth/register/verify", { email, otp });
  localStorage.setItem("cta_token", data.token);
  localStorage.setItem("cta_user", JSON.stringify(data.user));
  return data.user;
}

export function changeLocalPassword(user, currentPassword, nextPassword) {
  const localUsers = JSON.parse(localStorage.getItem("cta_registered_users") || "[]");
  const index = localUsers.findIndex((item) => item.email === user?.email);

  if (index === -1) {
    if (currentPassword !== "password") throw new Error("Current password is incorrect for demo account.");
    localStorage.setItem(`cta_demo_password_${user.email}`, nextPassword);
    return;
  }

  if (localUsers[index].password !== currentPassword) throw new Error("Current password is incorrect.");
  localUsers[index].password = nextPassword;
  localStorage.setItem("cta_registered_users", JSON.stringify(localUsers));
}

const STORAGE_KEY = "cta_complaints";

function routeComplaint(category = "") {
  const value = category.toLowerCase();
  if (value.includes("road") || value.includes("pothole")) return { departmentId: "dept-roads", officer: "Officer Sharma" };
  if (value.includes("water") || value.includes("leak")) return { departmentId: "dept-water", officer: "Water Supply Queue" };
  if (value.includes("sanitation") || value.includes("garbage") || value.includes("dumping")) return { departmentId: "dept-sanitation", officer: "Sanitation Queue" };
  if (value.includes("electricity") || value.includes("light")) return { departmentId: "dept-electricity", officer: "Electricity Queue" };
  return { departmentId: "dept-general", officer: "Intake Queue" };
}

function readLocalComplaints() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const records = stored ? JSON.parse(stored) : seedComplaints;
  const normalized = records.map((item) => {
    if (item.departmentId && item.officer) return item;
    const routing = routeComplaint(item.category);
    return { ...item, departmentId: item.departmentId || routing.departmentId, officer: item.officer === "Pending assignment" || !item.officer ? routing.officer : item.officer };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function writeLocalComplaints(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}

export async function listComplaints(filters = {}) {
  try {
    const { data } = await api.get("/complaints", { params: filters });
    return data.map(fromApiComplaint);
  } catch (_error) {
    const search = (filters.search || "").toLowerCase();
    return visibleLocalComplaints().filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (search && !`${item.id} ${item.title} ${item.location} ${item.citizen}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }
}

export async function getComplaintDetail(id) {
  try {
    const { data } = await api.get(`/complaints/${id}`);
    return fromApiComplaint(data);
  } catch (_error) {
    return visibleLocalComplaints().find((item) => item.id === id || item._id === id);
  }
}

export async function createComplaint(payload) {
  try {
    const { data } = await api.post("/complaints", payload);
    return fromApiComplaint(data);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Complaint could not be saved to the backend. Start the server and log in again.");
  }
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/uploads", formData);
  return {
    ...data,
    url: data.url?.startsWith("http") ? data.url : `${api.defaults.baseURL.replace(/\/api$/, "")}${data.url}`
  };
}

export async function updateComplaintStatus(id, status, comment = "", proofUrls = []) {
  try {
    const { data } = await api.patch(`/complaints/${id}/status`, { status, comment, proofUrls });
    return fromApiComplaint(data);
  } catch (_error) {
    const records = readLocalComplaints();
    const updated = records.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        status,
        sla: status === "Resolved" || status === "Closed" ? "Completed" : item.sla,
        proofUrls: [...(item.proofUrls || []), ...proofUrls],
        timeline: [...(item.timeline || []), [status, comment || "Status updated just now"]]
      };
    });
    writeLocalComplaints(updated);
    return updated.find((item) => item.id === id);
  }
}

export async function updateComplaintAssignment(id, departmentId, assignedOfficerId, comment = "") {
  try {
    const { data } = await api.patch(`/complaints/${id}/assign`, { departmentId, assignedOfficerId, comment });
    return fromApiComplaint(data);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Complaint reassignment failed.");
  }
}

export async function reopenComplaint(id, reason) {
  try {
    const { data } = await api.post(`/complaints/${id}/reopen`, { reason });
    return fromApiComplaint(data);
  } catch (_error) {
    return updateComplaintStatus(id, "Reopened", reason || "Citizen requested reopening.");
  }
}

export async function submitFeedback(id, rating, feedbackText) {
  try {
    const { data } = await api.post(`/complaints/${id}/feedback`, { rating, feedbackText });
    return fromApiComplaint(data);
  } catch (_error) {
    const updated = readLocalComplaints().map((item) => item.id === id ? { ...item, rating, feedbackText } : item);
    writeLocalComplaints(updated);
    return updated.find((item) => item.id === id);
  }
}

export async function listDepartments() {
  try {
    const { data } = await api.get("/departments");
    return data.map(fromApiDepartment);
  } catch (_error) {
    return seedDepartments.map(fromApiDepartment);
  }
}

export async function saveDepartmentRecord(department) {
  const payload = {
    name: department.name,
    description: department.description,
    coverage: department.coverage,
    active: department.status !== "Disabled"
  };
  const { data } = department.id?.startsWith("dept-") && !department.isNew
    ? await api.patch(`/departments/${department.id}`, payload)
    : await api.post("/departments", payload);
  return fromApiDepartment(data);
}

export async function listUsers() {
  const { data } = await api.get("/users");
  return data.map(fromApiUser);
}

export async function saveUserRecord(user) {
  const payload = {
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: normalizeRole(user.role),
    departmentId: user.departmentId || departmentIdFromRole(user.role),
    isActive: user.status !== "Disabled",
    password: user.password
  };
  const { data } = user.id?.startsWith("new-")
    ? await api.post("/users", payload)
    : await api.patch(`/users/${user.id}`, payload);
  return fromApiUser(data);
}

export async function resetUserPassword(id, password) {
  await api.patch(`/users/${id}/password`, { password });
}

export async function listNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function getReportOverview() {
  try {
    const { data } = await api.get("/reports/overview");
    return data;
  } catch (_error) {
    const records = readLocalComplaints();
    const resolved = records.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
    return {
      total: records.length,
      resolutionRate: records.length ? Math.round((resolved / records.length) * 100) : 0,
      escalated: records.filter((item) => item.status === "Escalated").length,
      reopened: records.filter((item) => item.status === "Reopened").length,
      averageResponseHours: 6.8,
      byDepartment: seedDepartments,
      hotspots: []
    };
  }
}

function fromApiComplaint(item) {
  return {
    id: item.complaintId || item.id,
    _id: item._id,
    title: item.title,
    shortTitle: item.shortTitle || item.title,
    category: item.category,
    status: item.status,
    severity: item.severity,
    location: item.locationText || item.location,
    filed: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : item.filed,
    sla: item.sla || formatSla(item.slaDueAt, item.status),
    citizen: item.citizen || "Citizen",
    officer: item.officer || item.assignedOfficerId || "Pending assignment",
    description: item.description,
    landmark: item.landmark,
    rating: item.rating,
    feedbackText: item.feedbackText,
    mediaUrls: item.mediaUrls || [],
    proofUrls: item.proofUrls || [],
    slaDueAt: item.slaDueAt,
    departmentId: item.departmentId,
    assignedOfficerId: item.assignedOfficerId,
    timeline: (item.timeline || []).map((log) => [log.newStatus || log[0], log.comment || log[1] || "Updated"])
  };
}

function fromApiDepartment(item) {
  return {
    id: item._id || item.id,
    name: item.name,
    description: item.description || "",
    coverage: Array.isArray(item.zoneCoverage) ? item.zoneCoverage.join(", ") : item.coverage || "",
    status: item.active === false || item.status === "Disabled" ? "Disabled" : "Active",
    total: item.total || 0,
    resolved: item.resolved || item.resolvedRate || 0
  };
}

function fromApiUser(item) {
  return {
    id: item._id || item.id,
    name: item.name,
    email: item.email,
    mobile: item.mobile || "",
    role: displayRole(item.role, item.departmentId),
    departmentId: item.departmentId || "",
    scope: departmentScope(item.departmentId, item.role),
    status: item.isActive === false || item.status === "Disabled" ? "Disabled" : "Active",
    password: ""
  };
}

function normalizeRole(role = "citizen") {
  const value = role.toLowerCase();
  if (value.includes("admin")) return "admin";
  if (value.includes("officer")) return "officer";
  return "citizen";
}

function departmentIdFromRole(role = "") {
  const value = role.toLowerCase();
  if (value.includes("water")) return "dept-water";
  if (value.includes("sanitation")) return "dept-sanitation";
  if (value.includes("electricity")) return "dept-electricity";
  if (value.includes("road")) return "dept-roads";
  return "";
}

function displayRole(role = "citizen", departmentId = "") {
  if (role === "admin") return "Admin";
  if (role === "officer") return `Officer - ${departmentScope(departmentId, role)}`;
  return "Citizen";
}

function departmentScope(departmentId, role) {
  const names = {
    "dept-roads": "Public Roads",
    "dept-water": "Water Supply",
    "dept-sanitation": "Sanitation & Waste",
    "dept-electricity": "Electricity Grid"
  };
  if (role === "admin") return "System";
  return names[departmentId] || "General";
}

function formatSla(date, status) {
  if (["Resolved", "Closed"].includes(status)) return "Completed";
  if (!date) return "Pending";
  const hours = Math.ceil((new Date(date).getTime() - Date.now()) / 36e5);
  return hours <= 0 ? "Expired" : `${hours}h remaining`;
}

function visibleLocalComplaints() {
  const user = getStoredUser();
  const records = readLocalComplaints();

  if (!user) return records;
  if (user.role === "admin") return records;
  if (user.role === "officer") {
    return records.filter((item) => item.departmentId === user.departmentId || item.assignedOfficerId === user.id);
  }

  if (user.role === "citizen") {
    if (user.email === "citizen@cta.test" || user.id === "user-citizen") {
      return records.filter((item) => !item.citizenId || item.citizenId === "user-citizen" || item.citizen === "James Walker");
    }
    return records.filter((item) => item.citizenId === user.id || item.citizen === user.name || item.citizen === user.email);
  }

  return [];
}

export function getStoredUser() {
  const raw = localStorage.getItem("cta_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("cta_token");
  localStorage.removeItem("cta_user");
}
