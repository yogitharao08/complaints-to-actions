import React, { useState } from "react";
import { deleteCurrentUser, updateCurrentUser } from "../../api.js";
import { departmentNames } from "../../utils/constants.js";

export function EditProfilePage({ user, role, setActive, onUserUpdate }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    departmentId: user?.departmentId || ""
  });
  const [saving, setSaving] = useState(false);

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

      <div className="danger-zone-container">
        <h3>Danger Zone</h3>
        <p>Permanently delete your account and all associated notifications. This action cannot be undone.</p>
        <button
          type="button"
          className="danger-btn"
          onClick={async () => {
            if (window.confirm("Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.")) {
              try {
                await deleteCurrentUser();
                alert("Your account has been deleted.");
                localStorage.removeItem("cta_token");
                localStorage.removeItem("cta_user");
                window.dispatchEvent(new Event("cta_unauthorized"));
              } catch (error) {
                alert(error.response?.data?.message || "Profile could not be deleted.");
              }
            }
          }}
        >
          Delete Account
        </button>
      </div>
    </section>
  );
}
