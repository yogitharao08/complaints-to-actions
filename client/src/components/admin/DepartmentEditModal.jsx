import React, { useState } from "react";
import { Modal } from "../common/Modal.jsx";

export function DepartmentEditModal({ department, onClose, onSave }) {
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
