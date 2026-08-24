import React, { useState } from "react";
import { Modal } from "../common/Modal.jsx";

export function UserEditModal({ user, onClose, onSave }) {
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

  function updateRole(value) {
    const nextDepartment = value.includes("Water") ? "dept-water"
      : value.includes("Sanitation") ? "dept-sanitation"
        : value.includes("Electricity") ? "dept-electricity"
          : value.includes("Roads") ? "dept-roads"
            : form.departmentId;
    setForm({ ...form, role: value, departmentId: nextDepartment });
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
