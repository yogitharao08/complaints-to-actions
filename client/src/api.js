import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cta_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/register/verify")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = data.accessToken;
        localStorage.setItem("cta_token", newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem("cta_token");
        localStorage.removeItem("cta_user");
        window.dispatchEvent(new Event("cta_unauthorized"));
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export async function login(identifier, password) {
  const { data } = await api.post("/auth/login", { identifier, password });
  localStorage.setItem("cta_token", data.accessToken);
  localStorage.setItem("cta_user", JSON.stringify(data.user));
  return data.user;
}

export async function registerLocalAccount(payload) {
  const { data } = await api.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    address: payload.address,
    password: payload.password
  });
  return data;
}

export async function verifyCitizenRegistration(email, otp) {
  const { data } = await api.post("/auth/register/verify", { email, otp });
  localStorage.setItem("cta_token", data.accessToken);
  localStorage.setItem("cta_user", JSON.stringify(data.user));
  return data.user;
}

export async function updateCurrentUser(profile) {
  const { data } = await api.patch("/users/me", {
    name: profile.name,
    email: profile.email,
    mobile: profile.mobile,
    address: profile.address
  });
  const current = getStoredUser() || {};
  const nextUser = { ...current, ...data };
  localStorage.setItem("cta_user", JSON.stringify(nextUser));
  return nextUser;
}

export async function changeLocalPassword(_user, currentPassword, nextPassword) {
  await api.patch("/users/me/password", { currentPassword, nextPassword });
}

export async function deleteCurrentUser() {
  await api.delete("/users/me");
}

export async function deleteUserRecord(id) {
  await api.delete(`/users/${id}`);
}

export async function listComplaints(filters = {}) {
  const { data } = await api.get("/complaints", { params: filters });
  return data.map(fromApiComplaint);
}

export async function getComplaintDetail(id) {
  const { data } = await api.get(`/complaints/${id}`);
  return fromApiComplaint(data);
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
  const { data } = await api.patch(`/complaints/${id}/status`, { status, comment, proofUrls });
  return fromApiComplaint(data);
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
  const { data } = await api.post(`/complaints/${id}/reopen`, { reason });
  return fromApiComplaint(data);
}

export async function submitFeedback(id, rating, feedbackText) {
  const { data } = await api.post(`/complaints/${id}/feedback`, { rating, feedbackText });
  return fromApiComplaint(data);
}

export async function listDepartments() {
  const { data } = await api.get("/departments");
  return data.map(fromApiDepartment);
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
    address: user.address,
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
  const { data } = await api.get("/reports/overview");
  return data;
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
    address: item.address || "",
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

export function getStoredUser() {
  const raw = localStorage.getItem("cta_user");
  return raw ? JSON.parse(raw) : null;
}

export async function logout() {
  localStorage.removeItem("cta_token");
  localStorage.removeItem("cta_user");
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout request failed:", error);
  }
}
