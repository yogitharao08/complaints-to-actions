import React, { useState } from "react";
import { MapPin, MessageSquare, UserRound } from "lucide-react";
import { changeLocalPassword } from "../../api.js";
import { departmentNames } from "../../utils/constants.js";

export function ProfilePage({ user, role, setActive, records }) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

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
