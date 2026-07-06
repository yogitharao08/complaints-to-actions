import React, { useEffect, useMemo, useState, useRef } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
  Users
} from "lucide-react";
import {
  createComplaint,
  changeLocalPassword,
  getComplaintDetail,
  getReportOverview,
  getStoredUser,
  listDepartments,
  listComplaints,
  listNotifications,
  listUsers,
  login,
  logout,
  markNotificationRead,
  registerLocalAccount,
  reopenComplaint,
  resetUserPassword,
  saveDepartmentRecord,
  saveUserRecord,
  updateCurrentUser,
  updateComplaintAssignment,
  updateComplaintStatus,
  uploadFile,
  verifyCitizenRegistration
} from "./api.js";
import { categories } from "./demoData.js";

const statusOptions = ["Submitted", "Assigned", "In Progress", "Resolved", "Closed", "Escalated"];
const assignmentOptions = [
  ["dept-roads", "officer-roads", "Public Roads / Roads Officer"],
  ["dept-water", "officer-water", "Water Supply / Water Officer"],
  ["dept-sanitation", "officer-sanitation", "Sanitation & Waste / Sanitation Officer"],
  ["dept-electricity", "officer-electricity", "Electricity Grid / Electricity Officer"]
];

function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button className="theme-toggle" onClick={() => onThemeChange(nextTheme)} type="button" aria-label={`Switch to ${nextTheme} mode`}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

function LandingPage({ theme, onThemeChange }) {
  const navigate = useNavigate();
  const highlights = [
    ["Simple Citizen Filing", "Citizens submit complaints with category, location, severity, and evidence."],
    ["Department Routing", "Complaints are routed to the officer responsible for the selected department."],
    ["Proof-Based Resolution", "Officers add updates and proof before marking complaints as resolved."],
    ["Admin Oversight", "Admins monitor all pending and completed work, users, departments, and reports."]
  ];
  const flow = ["Citizen files complaint", "System assigns department", "Officer updates progress", "Citizen verifies resolution", "Admin monitors everything"];

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <button className="landing-brand" onClick={() => navigate("/")} type="button">
          <Building2 size={28} />
          <span>Complaint to Action</span>
        </button>
        <div className="landing-nav-actions">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          <button className="primary" onClick={() => navigate("/login")} type="button">Login</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <small>Civic grievance and resolution platform</small>
          <h1>Turn public complaints into trackable action.</h1>
          <p>
            Complaint to Action helps citizens file grievances, routes each complaint to the right department,
            gives officers a clear work queue, and lets admins monitor resolution progress from one place.
          </p>
          <div className="landing-actions">
            <button className="primary" onClick={() => navigate("/login")} type="button">File a Complaint <ArrowRight size={18} /></button>
            <button className="outline" onClick={() => navigate("/login")} type="button">Open Portal</button>
          </div>
        </div>
        <div className="landing-panel" aria-label="Complaint workflow preview">
          <div className="landing-ticket-head">
            <span className="status status-assigned">Assigned</span>
            <strong>CTA-2026-000123</strong>
          </div>
          <h2>Water leakage near Ward 4 market</h2>
          <p>Assigned to Water Supply department with SLA tracking, officer updates, proof upload, and citizen verification.</p>
          <div className="landing-flow-preview">
            {["Submitted", "Assigned", "In Progress", "Resolved"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-title">
          <small>What the app does</small>
          <h2>A simple grievance flow for citizens, officers, and admins.</h2>
        </div>
        <div className="landing-feature-grid">
          {highlights.map(([title, text]) => (
            <article className="landing-feature" key={title}>
              <CheckCircle2 size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-flow-section">
        <div className="section-title">
          <small>Lifecycle</small>
          <h2>Every complaint has a visible path from filing to closure.</h2>
        </div>
        <div className="landing-flow">
          {flow.map((item, index) => (
            <div className="landing-flow-step" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-portals">
        <article>
          <UserRound size={24} />
          <h3>Citizen Portal</h3>
          <p>Create complaints, view timelines, see officer messages, preview proof, reopen unresolved work, and manage profile details.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
        <article>
          <ShieldCheck size={24} />
          <h3>Officer Portal</h3>
          <p>Department officers see only their assigned department complaints, update statuses, add notes, and upload resolution proof.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
        <article>
          <Building2 size={24} />
          <h3>Admin Portal</h3>
          <p>Admins manage users and departments, reassign complaints, view pending and resolved work, and export reports.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
      </section>
    </main>
  );
}

function StatusChip({ status = "Submitted" }) {
  return <span className={`status status-${status.toLowerCase().replace(/\s/g, "-")}`}>{status}</span>;
}

function LoginPage({ setUser, theme, onThemeChange }) {
  const [identifier, setIdentifier] = useState("citizen@cta.test");
  const [password, setPassword] = useState("password");
  const [creating, setCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", email: "", password: "", role: "citizen" });
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const signedIn = await login(identifier, password);
      setUser(signedIn);
      navigate(`/${signedIn.role}`);
    } catch (_error) {
      alert("Login failed. Start the backend server and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page simple-login">
      <div className="login-theme-action"><ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div>
      {!creating ? <form className="login-form simple-card" onSubmit={submit}>
        <div className="logo-row"><Building2 size={32} /><strong>Complaint to Action</strong></div>
        <h2>Login</h2>
        <label>Email or Mobile<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <div className="prefill-container">
          <span className="prefill-label">Quick Prefill (Demo Accounts)</span>
          <div className="prefill-buttons">
            <button type="button" className="soft small" onClick={() => { setIdentifier("citizen@cta.test"); setPassword("password"); }}>Citizen</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("admin@cta.test"); setPassword("password"); }}>Admin</button>
          </div>
          <span className="prefill-label" style={{ marginTop: "4px" }}>Officers by Department:</span>
          <div className="prefill-buttons">
            <button type="button" className="soft small" onClick={() => { setIdentifier("roads@cta.test"); setPassword("password"); }}>Roads</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("water@cta.test"); setPassword("password"); }}>Water</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("sanitation@cta.test"); setPassword("password"); }}>Sanitation</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("electricity@cta.test"); setPassword("password"); }}>Electricity</button>
          </div>
        </div>
        <button className="primary full" disabled={busy} type="submit">{busy ? "Logging in..." : "Login"}</button>
        <button className="outline full" type="button" onClick={() => setCreating(true)}>Create Account</button>
        <div className="login-links">
          <button className="link" type="button" onClick={() => navigate("/")}>Home</button>
        </div>
      </form> : <form className="login-form simple-card" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
          if (!otpSent) {
            const registration = await registerLocalAccount(newAccount);
            setOtpSent(true);
            alert(registration.previewUrl ? `OTP sent. Ethereal preview: ${registration.previewUrl}` : "OTP sent to your email.");
          } else {
            const signedIn = await verifyCitizenRegistration(newAccount.email, registrationOtp);
            setUser(signedIn);
            navigate(`/${signedIn.role}`);
          }
        } catch (error) {
          alert(error.response?.data?.message || error.message);
        } finally {
          setBusy(false);
        }
      }}>
        <div className="logo-row"><Building2 size={32} /><strong>Complaint to Action</strong></div>
        <h2>{otpSent ? "Verify Email" : "Create Account"}</h2>
        <p>{otpSent ? `Enter the OTP sent to ${newAccount.email}.` : "Create a citizen account with email verification."}</p>
        {!otpSent && (
          <>
            <label>Name<input required value={newAccount.name} onChange={(event) => setNewAccount({ ...newAccount, name: event.target.value })} /></label>
            <label>Email<input required type="email" value={newAccount.email} onChange={(event) => setNewAccount({ ...newAccount, email: event.target.value })} /></label>
            <label>Password<input required type="password" value={newAccount.password} onChange={(event) => setNewAccount({ ...newAccount, password: event.target.value })} /></label>
          </>
        )}
        {otpSent && <label>OTP<input required inputMode="numeric" maxLength="6" value={registrationOtp} onChange={(event) => setRegistrationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label>}
        <input type="hidden" value="citizen" readOnly />
        <p className="form-note">Public registration is only for citizens. Officer and admin accounts are created by an administrator.</p>
        <button className="primary full" disabled={busy} type="submit">{busy ? "Please wait..." : otpSent ? "Verify & Continue" : "Send OTP"}</button>
        {otpSent && <button className="outline full" disabled={busy} type="button" onClick={async () => {
          setBusy(true);
          try {
            const registration = await registerLocalAccount(newAccount);
            setRegistrationOtp("");
            alert(registration.previewUrl ? `A new OTP has been sent. Ethereal preview: ${registration.previewUrl}` : "A new OTP has been sent.");
          } catch (error) {
            alert(error.response?.data?.message || error.message);
          } finally {
            setBusy(false);
          }
        }}>Resend OTP</button>}
        <button className="outline full" type="button" onClick={() => {
          setCreating(false);
          setOtpSent(false);
          setRegistrationOtp("");
        }}>Back to Login</button>
        <button className="link full" type="button" onClick={() => navigate("/")}>Back to Home</button>
      </form>}
    </main>
  );
}

function Shell({ role, active, setActive, children, onExit, theme, onThemeChange }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = getStoredUser();
  const userName = user?.name || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const nav = role === "Citizen"
    ? [["Dashboard", LayoutDashboard], ["My Complaints", ClipboardList], ["File Complaint", Plus], ["Profile", UserRound]]
    : role === "Officer"
      ? [["Dashboard", LayoutDashboard], ["Assigned Complaints", ClipboardList], ["Profile", UserRound]]
      : [["Dashboard", LayoutDashboard], ["All Complaints", ClipboardList], ["Users", Users], ["Departments", Building2], ["Profile", UserRound]];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const headerNav = nav.filter(([label]) => label !== "Profile");

  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    listNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, [role]);

  async function readNotification(note) {
    if (!note.isRead) {
      await markNotificationRead(note._id || note.id).catch(() => null);
      setNotifications((items) => items.map((item) => (item._id || item.id) === (note._id || note.id) ? { ...item, isRead: true } : item));
    }
  }

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="header-brand">
          <Building2 size={24} />
          <div>
            <h1>Complaint to Action</h1>
            <p>{role} Portal</p>
          </div>
        </div>

        <nav className="header-nav">
          {headerNav.map(([label, Icon]) => (
            <button
              className={active === label ? "active nav-link" : "nav-link"}
              key={label}
              onClick={() => setActive(label)}
              type="button"
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="notification-wrapper" ref={notificationsRef}>
            <button
              className="action-btn notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              type="button"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="header-notification-panel">
                <div className="panel-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-btn"
                      onClick={async () => {
                        const unreadNotes = notifications.filter((n) => !n.isRead);
                        await Promise.all(
                          unreadNotes.map((n) => markNotificationRead(n._id || n.id).catch(() => null))
                        );
                        setNotifications((items) =>
                          items.map((item) => ({ ...item, isRead: true }))
                        );
                      }}
                      type="button"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="panel-content">
                  {notifications.length === 0 && <p className="empty-text">No notifications yet.</p>}
                  {notifications.map((note) => (
                    <button
                      className={note.isRead ? "notification-item" : "notification-item unread"}
                      key={note._id || note.id}
                      onClick={() => {
                        readNotification(note);
                        setShowNotifications(false);
                      }}
                      type="button"
                    >
                      <strong>{note.title}</strong>
                      <span>{note.message}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          <div className="profile-wrapper" ref={profileMenuRef}>
            <button
              className="profile-avatar-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              type="button"
              aria-label="User profile menu"
            >
              {userInitials}
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <strong>{userName}</strong>
                  <span>{role}</span>
                </div>
                <div className="profile-dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActive("Profile");
                    setShowProfileMenu(false);
                  }}
                  type="button"
                >
                  <UserRound size={14} />
                  <span>View Profile</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActive("Profile");
                    setShowProfileMenu(false);
                  }}
                  type="button"
                >
                  <FileText size={14} />
                  <span>Edit Profile</span>
                </button>
                <div className="profile-dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onExit();
                  }}
                  type="button"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="portal-body">
        <main className="content simple-content">{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <section className="page-head simple-head">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {right}
    </section>
  );
}

function useComplaintList() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const data = await listComplaints({ search });
    setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [search]);

  return { records, search, setSearch, loading, refresh };
}

function useComplaintDetail() {
  const [selected, setSelected] = useState(null);

  async function openComplaint(row) {
    setSelected({ ...row, loadingDetail: true });
    const detail = await getComplaintDetail(row.id || row._id);
    setSelected(detail || row);
  }

  return { selected, setSelected, openComplaint };
}

function CitizenPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const activeCount = records.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
  const resolvedNeedsReview = records.filter((item) => item.status === "Resolved").length;

  return (
    <Shell role="Citizen" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title={`Welcome, ${user?.name || "Citizen"}`} subtitle="File complaints and track their progress from one simple place." right={<button className="primary" onClick={() => setActive("File Complaint")}><Plus size={16} /> File Complaint</button>} />
          <StatsCards stats={[["Total Complaints", records.length], ["Active", activeCount], ["Resolved", records.filter((item) => item.status === "Resolved").length]]} />
          {resolvedNeedsReview > 0 && <section className="notice-card">You have {resolvedNeedsReview} resolved complaint(s) waiting for your accept/reopen decision.</section>}
          <ComplaintTable title="Recent Complaints" rows={records.slice(0, 5)} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "File Complaint" && <ComplaintFormCard existingComplaints={records} onCreated={async () => {
        await refresh();
        setActive("My Complaints");
      }} />}
      {active === "My Complaints" && (
        <>
          <ListToolbar title="My Complaints" search={search} setSearch={setSearch} />
          <ComplaintTable rows={records} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "Profile" && <ProfilePage user={user} role="Citizen" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Citizen" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} onCitizenDecision={async (decision) => {
        if (decision.type === "close") {
          await updateComplaintStatus(selected.id, "Closed", "Citizen accepted the resolution.");
        } else {
          await reopenComplaint(selected.id, decision.reason);
        }
        setSelected(null);
        await refresh();
      }} />}
    </Shell>
  );
}

function ComplaintFormCard({ onCreated, existingComplaints = [] }) {
  const [form, setForm] = useState({ title: "", description: "", category: categories[0].name, severity: "medium", locationText: "", landmark: "" });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }
  function updateRole(value) {
    const nextDepartment = value.includes("Water") ? "dept-water"
      : value.includes("Sanitation") ? "dept-sanitation"
        : value.includes("Electricity") ? "dept-electricity"
          : value.includes("Roads") ? "dept-roads"
            : form.departmentId;
    setForm({ ...form, role: value, departmentId: nextDepartment });
  }

  async function submit(event) {
    event.preventDefault();
    const duplicate = existingComplaints.find((item) =>
      item.category === form.category &&
      item.location?.trim().toLowerCase() === form.locationText.trim().toLowerCase() &&
      !["Resolved", "Closed"].includes(item.status)
    );
    if (duplicate && !window.confirm(`A similar active complaint already exists: ${duplicate.id}. Submit anyway?`)) return;
    setSaving(true);
    try {
      const uploaded = evidenceFile ? await uploadFile(evidenceFile) : null;
      await createComplaint({ ...form, mediaUrls: uploaded ? [uploaded.url] : [] });
      setForm({ title: "", description: "", category: categories[0].name, severity: "medium", locationText: "", landmark: "" });
      setEvidenceFile(null);
      await onCreated();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="table-card simple-card page-panel">
      <div className="table-head"><h2>File a Complaint</h2></div>
      <form className="modal-form" onSubmit={submit}>
        <label>Title<input required value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label>Description<textarea required value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
        <div className="form-grid">
          <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label>Severity<select value={form.severity} onChange={(event) => update("severity", event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
        </div>
        <label>Location<input required value={form.locationText} onChange={(event) => update("locationText", event.target.value)} /></label>
        <label>Landmark<input value={form.landmark} onChange={(event) => update("landmark", event.target.value)} /></label>
        <label className="proof-upload">Evidence file<input type="file" accept="image/*,video/*,.pdf" onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} />{evidenceFile && <p>{evidenceFile.name} selected</p>}</label>
        <button className="primary" disabled={saving} type="submit">{saving ? "Submitting..." : "Submit Complaint"}</button>
      </form>
    </section>
  );
}

function OfficerPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const [actionComplaint, setActionComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const pending = records.filter((item) => !["Resolved", "Closed"].includes(item.status));
  const visibleRecords = statusFilter ? records.filter((item) => item.status === statusFilter) : records;

  return (
    <Shell role="Officer" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title={`Officer Dashboard`} subtitle={`Logged in as ${user?.name || "Officer"}. Handle assigned complaints and update progress.`} />
          <StatsCards stats={[["Assigned", records.length], ["Pending", pending.length], ["Done", records.filter((item) => item.status === "Resolved").length]]} />
          <section className="analytics-grid">
            <article className="chart-card">
              <div className="chart-title"><BarChart3 size={18} /><h2>Status Overview</h2></div>
              <div className="bar-list">
                {statusOptions.map((status) => {
                  const count = records.filter((item) => item.status === status).length;
                  const maxStatus = Math.max(1, ...records.map((item) => 1));
                  return (
                    <div className="bar-row" key={status}>
                      <span>{status}</span>
                      <div><i style={{ width: `${Math.max(4, (count / Math.max(1, records.length)) * 100)}%` }} /></div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
          <ComplaintTable title="Assigned Complaints" rows={visibleRecords} loading={loading} onView={openComplaint} onAction={setActionComplaint} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        </>
      )}
      {active === "Assigned Complaints" && (
        <>
          <ListToolbar title="Assigned Complaints" search={search} setSearch={setSearch} />
          <ComplaintTable rows={visibleRecords} loading={loading} onView={openComplaint} onAction={setActionComplaint} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        </>
      )}
      {active === "Profile" && <ProfilePage user={user} role="Officer" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Officer" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} />}
      {actionComplaint && <OfficerAction complaint={actionComplaint} onClose={() => setActionComplaint(null)} onSaved={async () => {
        setActionComplaint(null);
        await refresh();
      }} />}
    </Shell>
  );
}

function AdminPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const [report, setReport] = useState(null);
  const done = records.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
  const pending = records.length - done;

  useEffect(() => {
    getReportOverview().then(setReport).catch(() => setReport(null));
  }, [records.length]);

  return (
    <Shell role="Admin" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title="Admin Dashboard" subtitle="Monitor all complaints, pending work, resolved cases, users, and departments." right={<button className="outline" onClick={() => exportComplaints(records)}><Download size={16} /> Export CSV</button>} />
          <StatsCards stats={[["All Complaints", records.length], ["Pending", pending], ["Done", done], ["Escalated", records.filter((item) => item.status === "Escalated").length]]} />
          <AnalyticsCharts report={report} records={records} />
          <ComplaintTable title="All Complaints" rows={records.slice(0, 8)} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "All Complaints" && (
        <>
          <ListToolbar title="All Complaints" search={search} setSearch={setSearch} right={<button className="outline" onClick={() => exportComplaints(records)}><Download size={16} /> Export CSV</button>} />
          <ComplaintTable rows={records} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "Users" && <UsersSimple />}
      {active === "Departments" && <DepartmentsSimple records={records} />}
      {active === "Profile" && <ProfilePage user={user} role="Admin" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Admin" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} onAdminReassign={async (assignment) => {
        await updateComplaintAssignment(selected.id, assignment.departmentId, assignment.assignedOfficerId, "Admin reassigned complaint.");
        setSelected(null);
        await refresh();
      }} />}
    </Shell>
  );
}

function AnalyticsCharts({ report, records }) {
  const statusData = report?.byStatus?.length ? report.byStatus : statusOptions.map((status) => ({ status, count: records.filter((item) => item.status === status).length }));
  const departmentData = report?.byDepartment?.length ? report.byDepartment : [];
  const maxStatus = Math.max(1, ...statusData.map((item) => item.count || 0));
  const maxDepartment = Math.max(1, ...departmentData.map((item) => item.total || 0));

  return (
    <section className="analytics-grid">
      <article className="chart-card">
        <div className="chart-title"><BarChart3 size={18} /><h2>Status Overview</h2></div>
        <div className="bar-list">
          {statusData.map((item) => (
            <div className="bar-row" key={item.status}>
              <span>{item.status}</span>
              <div><i style={{ width: `${Math.max(4, ((item.count || 0) / maxStatus) * 100)}%` }} /></div>
              <strong>{item.count || 0}</strong>
            </div>
          ))}
        </div>
      </article>
      <article className="chart-card">
        <div className="chart-title"><Building2 size={18} /><h2>Department Load</h2></div>
        <div className="bar-list">
          {departmentData.length === 0 && <p>No department data yet.</p>}
          {departmentData.map((item) => (
            <div className="bar-row" key={item.name}>
              <span>{item.name}</span>
              <div><i style={{ width: `${Math.max(4, ((item.total || 0) / maxDepartment) * 100)}%` }} /></div>
              <strong>{item.total || 0}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function ProfilePage({ user, role, setActive, records }) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

  const departmentNames = {
    "dept-roads": "Public Roads",
    "dept-water": "Water Supply",
    "dept-sanitation": "Sanitation & Waste",
    "dept-electricity": "Electricity Grid"
  };

  async function savePassword(event) {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      alert("New password and confirmation do not match.");
      return;
    }
    try {
      await changeLocalPassword(user, passwordForm.current, passwordForm.next);
      setChangingPassword(false);
      setPasswordForm({ current: "", next: "", confirm: "" });
      alert("Password changed in MongoDB.");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }

  // Calculate stats based on role and records
  let stat1 = { label: "Filed", value: 0 };
  let stat2 = { label: "Pending", value: 0 };
  let stat3 = { label: "Resolved", value: 0 };

  if (records) {
    if (role === "Citizen") {
      stat1 = { label: "Complaints", value: records.length };
      stat2 = { label: "Pending", value: records.filter((item) => !["Resolved", "Closed"].includes(item.status)).length };
      stat3 = { label: "Resolved", value: records.filter((item) => item.status === "Resolved").length };
    } else if (role === "Officer") {
      stat1 = { label: "Assigned", value: records.length };
      stat2 = { label: "Pending", value: records.filter((item) => !["Resolved", "Closed"].includes(item.status)).length };
      stat3 = { label: "Resolved", value: records.filter((item) => item.status === "Resolved").length };
    } else if (role === "Admin") {
      stat1 = { label: "Total complaints", value: records.length };
      stat2 = { label: "Pending", value: records.filter((item) => !["Resolved", "Closed"].includes(item.status)).length };
      stat3 = { label: "Resolved", value: records.filter((item) => ["Resolved", "Closed"].includes(item.status)).length };
    }
  }

  const deptName = departmentNames[user?.departmentId] || (role === "Admin" ? "System Administration" : role === "Citizen" ? "Citizen Services" : "-");

  return (
    <div className="profile-container-premium">
      <div className="profile-card-premium">
        {/* Pink/Coral Gradient Banner */}
        <div className="profile-banner-bg"></div>

        {/* Top Left Connect/Edit and Top Right Message/Password Actions */}
        <div className="profile-top-actions-wrapper">
          <button className="profile-top-action" onClick={() => setActive("EditProfile")} type="button">
            <UserRound size={16} />
            <span>Edit Profile</span>
          </button>
          <button className="profile-top-action" onClick={() => setChangingPassword(!changingPassword)} type="button">
            <MessageSquare size={16} />
            <span>Password</span>
          </button>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-container">
          <div className="profile-avatar-premium">
            {(user?.name || role).slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content-premium">
          <h2>{user?.name || `${role} User`}</h2>
          <div className="location">
            <MapPin size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            <span>{user?.address || "No address provided"}</span>
          </div>

          <div className="description">
            <p><strong>{role}</strong> &bull; {deptName}</p>
            <p className="description-meta">{user?.email || "No email"} &bull; {user?.mobile || "No mobile"}</p>
          </div>

          {/* Stats Section */}
          <div className="profile-stats-premium">
            <div className="stat-item-premium">
              <strong>{stat1.value}</strong>
              <span>{stat1.label}</span>
            </div>
            <div className="stat-item-premium">
              <strong>{stat2.value}</strong>
              <span>{stat2.label}</span>
            </div>
            <div className="stat-item-premium">
              <strong>{stat3.value}</strong>
              <span>{stat3.label}</span>
            </div>
          </div>

          {/* Expandable Details Container */}
          {showDetails && (
            <div className="info-grid profile-info" style={{ marginTop: "8px", width: "100%", textAlign: "left" }}>
              <div><small>Name</small><p>{user?.name || "-"}</p></div>
              <div><small>Email</small><p>{user?.email || "-"}</p></div>
              <div><small>Mobile</small><p>{user?.mobile || "-"}</p></div>
              <div><small>Address / Zone</small><p>{user?.address || "-"}</p></div>
              <div><small>Role</small><p>{role}</p></div>
              <div><small>Department</small><p>{deptName}</p></div>
              <div><small>User ID</small><p>{user?.id || "-"}</p></div>
              <div><small>Account Status</small><p>Active</p></div>
            </div>
          )}

          {/* Pill Button "Show more" toggles details panel */}
          <button className="profile-pill-button" onClick={() => setShowDetails(!showDetails)} type="button">
            {showDetails ? "Show less" : "Show more"}
          </button>
        </div>
      </div>

      {changingPassword && (
        <div className="password-card-premium">
          <form className="profile-edit-form" onSubmit={savePassword}>
            <h3>Change Password</h3>
            <label>Current password<input required type="password" value={passwordForm.current} onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })} /></label>
            <div className="form-grid">
              <label>New password<input required type="password" value={passwordForm.next} onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })} /></label>
              <label>Confirm password<input required type="password" value={passwordForm.confirm} onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })} /></label>
            </div>
            <button className="primary" type="submit">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}

function EditProfilePage({ user, role, setActive, onUserUpdate }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    departmentId: user?.departmentId || ""
  });
  const [saving, setSaving] = useState(false);

  const departmentNames = {
    "dept-roads": "Public Roads",
    "dept-water": "Water Supply",
    "dept-sanitation": "Sanitation & Waste",
    "dept-electricity": "Electricity Grid"
  };

  function update(field, value) {
    setProfile({ ...profile, [field]: value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateCurrentUser(profile);
      if (onUserUpdate) onUserUpdate(saved);
      alert("Profile saved to MongoDB.");
      setActive("Profile");
    } catch (error) {
      alert(error.response?.data?.message || "Profile could not be saved to MongoDB.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="table-card page-panel profile-card">
      <div className="table-head">
        <h2>Edit Profile</h2>
      </div>
      <div className="profile-grid">
        <div className="profile-avatar">{(profile.name || role).slice(0, 2).toUpperCase()}</div>
        <div>
          <h2>{profile.name || `${role} User`}</h2>
          <p>{profile.email || "No email available"}</p>
        </div>
      </div>
      <form className="profile-edit-form" onSubmit={saveProfile}>
        <div className="form-grid">
          <label>Name<input required value={profile.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>Email<input required value={profile.email} onChange={(event) => update("email", event.target.value)} /></label>
        </div>
        <div className="form-grid">
          <label>Mobile<input value={profile.mobile} onChange={(event) => update("mobile", event.target.value)} placeholder="Enter mobile number" /></label>
          <label>Address / Zone<input value={profile.address} onChange={(event) => update("address", event.target.value)} placeholder="Enter address or service zone" /></label>
        </div>
        {role === "Officer" && (
          <label>Department
            <select value={profile.departmentId} onChange={(event) => update("departmentId", event.target.value)}>
              {Object.entries(departmentNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
        )}
        <div className="button-row">
          <button className="outline" type="button" onClick={() => setActive("Profile")}>Cancel</button>
          <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
        </div>
      </form>
    </section>
  );
}

function StatsCards({ stats }) {
  return (
    <section className="metric-grid simple-stats">
      {stats.map(([label, value]) => (
        <article className="metric" key={label}>
          <div><small>{label}</small><h2>{value}</h2></div>
          <span><FileText size={24} /></span>
        </article>
      ))}
    </section>
  );
}

function ListToolbar({ title, search, setSearch, right }) {
  return (
    <section className="page-head simple-head">
      <div><h1>{title}</h1><p>Search by ID, title, category, or location.</p></div>
      <div className="toolbar-actions"><div className="search inline-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints..." /></div>{right}</div>
    </section>
  );
}

function ComplaintTable({ title = "Complaints", rows, loading, onView, onAction, statusFilter, setStatusFilter }) {
  return (
    <section className="table-card page-panel">
      <div className="table-head"><h2>{title}</h2>{setStatusFilter && <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All Status</option>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select>}</div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>ID</th><th>Complaint</th><th>Category</th><th>Location</th><th>SLA</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="7">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="7">No complaints found.</td></tr>}
            {!loading && rows.map((row) => (
              <tr key={row.id}>
                <td className="id">{row.id}</td>
                <td><strong>{row.shortTitle || row.title}</strong><span>{row.filed}</span></td>
                <td>{row.category}</td>
                <td>{row.location}</td>
                <td><span className={row.sla === "Expired" ? "sla danger" : "sla"}>{row.sla}</span></td>
                <td><StatusChip status={row.status} /></td>
                <td>
                  <button className="soft small" onClick={() => onView(row)}>View</button>
                  {onAction && <button className="primary small" onClick={() => onAction(row)}>Update</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComplaintDetail({ complaint, onClose, onCitizenDecision, onAdminReassign }) {
  const [reopenReason, setReopenReason] = useState("");
  const [assignment, setAssignment] = useState(complaint.departmentId || "dept-roads");
  const timeline = complaint.timeline || [];
  const canVerify = onCitizenDecision && complaint.status === "Resolved";
  const selectedAssignment = assignmentOptions.find(([departmentId]) => departmentId === assignment) || assignmentOptions[0];
  return (
    <Modal title={complaint.id} onClose={onClose}>
      <div className="detail-modal">
        <div className="split-row"><h2>{complaint.title}</h2><StatusChip status={complaint.status} /></div>
        {complaint.loadingDetail && <p>Loading latest officer updates...</p>}
        <p>{complaint.description || "No description available."}</p>
        <div className="info-grid">
          <div><small>Category</small><p>{complaint.category}</p></div>
          <div><small>Severity</small><p>{complaint.severity || "medium"}</p></div>
          <div><small>Location</small><p>{complaint.location}</p></div>
          <div><small>Officer / Queue</small><p>{complaint.officer}</p></div>
        </div>
        {complaint.mediaUrls?.length > 0 && (
          <>
            <h3>Citizen Evidence</h3>
            <div className="proof-list">
              {complaint.mediaUrls.map((proof, index) => <ProofPreview proof={proof} key={`${proof}-${index}`} />)}
            </div>
          </>
        )}
        {complaint.proofUrls?.length > 0 && (
          <>
            <h3>Proof</h3>
            <div className="proof-list">
              {complaint.proofUrls.map((proof, index) => <ProofPreview proof={proof} key={`${proof}-${index}`} />)}
            </div>
          </>
        )}
        <h3>Simple Flow</h3>
        <div className="simple-flow">
          {["Submitted", "Assigned", "In Progress", "Resolved", "Closed"].map((step) => <span className={step === complaint.status ? "current" : ""} key={step}>{step}</span>)}
        </div>
        <h3>Officer Updates</h3>
        <div className="update-list">
          {timeline.length === 0 && <p>No officer updates yet.</p>}
          {timeline.map(([status, message], index) => (
            <article className="update-item" key={`${status}-${index}`}>
              <strong>{status}</strong>
              <p>{message}</p>
            </article>
          ))}
        </div>
        {canVerify && (
          <div className="citizen-verification">
            <h3>Citizen Verification</h3>
            <p>Review the officer update and choose whether the issue is fixed.</p>
            <div className="button-row">
              <button className="primary" onClick={() => onCitizenDecision({ type: "close" })}>Accept & Close</button>
            </div>
            <label>Reopen reason<textarea value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} placeholder="Explain what is still unresolved." /></label>
            <button className="outline" onClick={() => {
              if (!reopenReason.trim()) {
                alert("Please enter a reopen reason.");
                return;
              }
              onCitizenDecision({ type: "reopen", reason: reopenReason });
            }}>Reopen Complaint</button>
          </div>
        )}
        {onAdminReassign && (
          <div className="citizen-verification">
            <h3>Admin Reassignment</h3>
            <label>Department / Officer<select value={assignment} onChange={(event) => setAssignment(event.target.value)}>{assignmentOptions.map(([departmentId, , label]) => <option key={departmentId} value={departmentId}>{label}</option>)}</select></label>
            <button className="primary" onClick={() => onAdminReassign({ departmentId: selectedAssignment[0], assignedOfficerId: selectedAssignment[1] })}>Reassign Complaint</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function OfficerAction({ complaint, onClose, onSaved }) {
  const [status, setStatus] = useState(complaint.status === "Submitted" ? "Assigned" : "In Progress");
  const [comment, setComment] = useState("");
  const [proof, setProof] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileProof, setFileProof] = useState("");
  const [uploading, setUploading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (status === "Resolved" && !proof && !fileName) {
      alert("Please add proof before resolving.");
      return;
    }
    await updateComplaintStatus(complaint.id, status, comment || `Officer marked complaint as ${status}.`, proof || fileProof || fileName ? [proof || fileProof || fileName] : []);
    await onSaved();
  }

  return (
    <Modal title={`Update ${complaint.id}`} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <h2>{complaint.title}</h2>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Officer note<textarea value={comment} onChange={(event) => setComment(event.target.value)} /></label>
        <label>Proof URL<input value={proof} onChange={(event) => setProof(event.target.value)} placeholder="Required when resolving" /></label>
        <label>Upload proof<input type="file" accept="image/*,video/*,.pdf" onChange={async (event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name || "");
          if (!file) {
            setFileProof("");
            return;
          }
          setUploading(true);
          try {
            const uploaded = await uploadFile(file);
            setFileProof(uploaded.url);
          } catch (error) {
            alert(error.response?.data?.message || "File upload failed.");
            setFileName("");
          } finally {
            setUploading(false);
          }
        }} /></label>
        {fileName && <p className="success-message">{uploading ? `Uploading ${fileName}...` : `${fileName} uploaded`}</p>}
        <div className="button-row"><button className="outline" type="button" onClick={onClose}>Cancel</button><button className="primary" disabled={uploading} type="submit">Save Update</button></div>
      </form>
    </Modal>
  );
}

function fileToProof(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(`${file.name}|${file.type}|${reader.result}`);
    reader.onerror = () => reject(new Error("Could not read proof file."));
    reader.readAsDataURL(file);
  });
}

function ProofPreview({ proof }) {
  const value = String(proof || "");
  const [name, type, dataUrl] = value.split("|");
  const isData = dataUrl?.startsWith("data:");
  const isUrl = value.startsWith("http");
  const lower = value.toLowerCase();
  const isImageUrl = isUrl && /\.(png|jpe?g|gif|webp|bmp)$/i.test(lower);
  const isVideoUrl = isUrl && /\.(mp4|webm|ogg|mov)$/i.test(lower);
  const label = isData ? name : value;

  if (isData && type?.startsWith("image/")) {
    return <div className="proof-item"><img src={dataUrl} alt={name} /><a href={dataUrl} download={name}>{name}</a></div>;
  }

  if (isData && type?.startsWith("video/")) {
    return <div className="proof-item"><video src={dataUrl} controls /><a href={dataUrl} download={name}>{name}</a></div>;
  }

  if (isData) {
    return <a className="proof-link" href={dataUrl} download={name}>{name}</a>;
  }

  if (isUrl) {
    if (isImageUrl) return <div className="proof-item"><img src={value} alt="Uploaded proof" /><a href={value} target="_blank" rel="noreferrer">Open proof</a></div>;
    if (isVideoUrl) return <div className="proof-item"><video src={value} controls /><a href={value} target="_blank" rel="noreferrer">Open proof</a></div>;
    return <a className="proof-link" href={value} target="_blank" rel="noreferrer">{value}</a>;
  }

  return <div className="proof-link">{label || "Proof attached"}</div>;
}

function UsersSimple() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers().then(setUsers).catch((error) => {
      alert(error.response?.data?.message || "Users could not be loaded from MongoDB.");
    }).finally(() => setLoading(false));
  }, []);

  function saveUsers(nextUsers) {
    setUsers(nextUsers);
  }

  async function saveUser(user) {
    try {
      const saved = await saveUserRecord(user);
      const exists = users.some((item) => item.id === saved.id);
      saveUsers(exists ? users.map((item) => item.id === saved.id ? saved : item) : [saved, ...users]);
      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || "User could not be saved.");
    }
  }

  async function resetPassword(user) {
    const nextPassword = window.prompt(`Set new password for ${user.name}`, "password");
    if (!nextPassword) return;
    try {
      await resetUserPassword(user.id, nextPassword);
      saveUsers(users.map((item) => item.id === user.id ? { ...item, password: "" } : item));
      alert(`Password reset for ${user.name}`);
    } catch (error) {
      alert(error.response?.data?.message || "Password could not be reset in MongoDB.");
    }
  }

  async function toggleStatus(user) {
    await saveUser({ ...user, status: user.status === "Active" ? "Disabled" : "Active" });
  }

  return (
    <section className="table-card page-panel">
      <div className="table-head"><h2>Users</h2><button className="primary" onClick={() => setEditing({ id: `new-user-${Date.now()}`, name: "", email: "", mobile: "", address: "", role: "Officer - Public Roads", departmentId: "dept-roads", scope: "Public Roads", status: "Active", password: "password" })}>Create User</button></div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Scope</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan="6">Loading users...</td></tr>}
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.scope}</td>
              <td>{user.status}</td>
              <td>
                <div className="table-actions">
                  <button className="soft small" onClick={() => setEditing(user)}>Edit</button>
                  <button className="outline small" onClick={() => resetPassword(user)}>Reset Password</button>
                  <button className="soft small" onClick={() => toggleStatus(user)}>{user.status === "Active" ? "Disable" : "Activate"}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <UserEditModal user={editing} onClose={() => setEditing(null)} onSave={saveUser} />}
    </section>
  );
}

function DepartmentsSimple({ records }) {
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDepartments().then(setDepartments).catch((error) => {
      alert(error.response?.data?.message || "Departments could not be loaded from MongoDB.");
    }).finally(() => setLoading(false));
  }, []);

  function saveDepartments(nextDepartments) {
    setDepartments(nextDepartments);
  }

  async function saveDepartment(department) {
    try {
      const saved = await saveDepartmentRecord(department);
      const exists = departments.some((item) => item.id === saved.id);
      saveDepartments(exists ? departments.map((item) => item.id === saved.id ? saved : item) : [saved, ...departments]);
      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || "Department could not be saved.");
    }
  }

  async function toggleDepartment(department) {
    await saveDepartment({ ...department, status: department.status === "Active" ? "Disabled" : "Active" });
  }

  return (
    <section className="table-card page-panel">
      <div className="table-head"><h2>Departments</h2><button className="primary" onClick={() => setEditing({ id: `new-dept-${Date.now()}`, isNew: true, name: "", description: "", coverage: "", status: "Active" })}>Add Department</button></div>
      <table>
        <thead><tr><th>Department</th><th>Description</th><th>Coverage</th><th>Status</th><th>Complaints</th><th>Pending</th><th>Action</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan="7">Loading departments...</td></tr>}
          {departments.map((department) => {
            const related = records.filter((item) => department.name.toLowerCase().includes((item.category || "").split(" ")[0].toLowerCase()));
            return (
              <tr key={department.id}>
                <td>{department.name}</td>
                <td>{department.description}</td>
                <td>{department.coverage}</td>
                <td>{department.status}</td>
                <td>{related.length}</td>
                <td>{related.filter((item) => !["Resolved", "Closed"].includes(item.status)).length}</td>
                <td>
                  <div className="table-actions">
                    <button className="soft small" onClick={() => setEditing(department)}>Edit</button>
                    <button className="outline small" onClick={() => toggleDepartment(department)}>{department.status === "Active" ? "Disable" : "Activate"}</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editing && <DepartmentEditModal department={editing} onClose={() => setEditing(null)} onSave={saveDepartment} />}
    </section>
  );
}

function exportComplaints(records) {
  const header = ["ID", "Title", "Category", "Location", "SLA", "Status"];
  const rows = records.map((item) => [item.id, item.title, item.category, item.location, item.sla, item.status].map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","));
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "complaints.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function UserEditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user);
  const departmentChoices = [
    ["dept-roads", "Public Roads"],
    ["dept-water", "Water Supply"],
    ["dept-sanitation", "Sanitation & Waste"],
    ["dept-electricity", "Electricity Grid"]
  ];
  function update(field, value) {
    setForm({ ...form, [field]: value });
  }
  return (
    <Modal title={`Edit ${user.name}`} onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}>
        <label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
        <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
        <div className="form-grid">
          <label>Role<select value={form.role} onChange={(event) => updateRole(event.target.value)}><option>Officer - Public Roads</option><option>Officer - Water Supply</option><option>Officer - Sanitation & Waste</option><option>Officer - Electricity Grid</option><option>Admin</option><option>Citizen</option></select></label>
          <label>Department<select value={form.departmentId || "dept-roads"} onChange={(event) => update("departmentId", event.target.value)}>{departmentChoices.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        </div>
        <label>Mobile<input value={form.mobile || ""} onChange={(event) => update("mobile", event.target.value)} /></label>
        <label>Address / Zone<input value={form.address || ""} onChange={(event) => update("address", event.target.value)} /></label>
        <label>Temporary Password<input value={form.password || ""} onChange={(event) => update("password", event.target.value)} /></label>
        <label>Status<select value={form.status} onChange={(event) => update("status", event.target.value)}><option>Active</option><option>Disabled</option></select></label>
        <div className="button-row"><button className="outline" type="button" onClick={onClose}>Cancel</button><button className="primary" type="submit">Save User</button></div>
      </form>
    </Modal>
  );
}

function DepartmentEditModal({ department, onClose, onSave }) {
  const [form, setForm] = useState(department);
  function update(field, value) {
    setForm({ ...form, [field]: value });
  }
  return (
    <Modal title={department.name ? `Edit ${department.name}` : "Add Department"} onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}>
        <label>Department Name<input required value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
        <label>Zone Coverage<input value={form.coverage} onChange={(event) => update("coverage", event.target.value)} /></label>
        <label>Status<select value={form.status} onChange={(event) => update("status", event.target.value)}><option>Active</option><option>Disabled</option></select></label>
        <div className="button-row"><button className="outline" type="button" onClick={onClose}>Cancel</button><button className="primary" type="submit">Save Department</button></div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head"><h2>{title}</h2><button className="ghost" onClick={onClose}>Close</button></div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [theme, setTheme] = useState(() => localStorage.getItem("cta_theme") || "dark");
  const navigate = useNavigate();
  const userHome = user ? `/${user.role}` : "/login";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cta_theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("cta_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("cta_unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  function exit() {
    logout();
    setUser(null);
    navigate("/login");
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage theme={theme} onThemeChange={setTheme} />} />
      <Route path="/login" element={user ? <Navigate to={userHome} /> : <LoginPage setUser={setUser} theme={theme} onThemeChange={setTheme} />} />
      <Route path="/officer/login" element={<Navigate to="/login" />} />
      <Route path="/admin/login" element={<Navigate to="/login" />} />
      <Route path="/citizen" element={user?.role === "citizen" ? <CitizenPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="/officer" element={user?.role === "officer" ? <OfficerPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="/admin" element={user?.role === "admin" ? <AdminPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="*" element={<Navigate to={userHome} />} />
    </Routes>
  );
}
