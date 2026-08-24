import React, { useState } from "react";
import { createComplaint, uploadFile } from "../../api.js";
import { categories } from "../../demoData.js";

export function ComplaintFormCard({ onCreated, existingComplaints = [] }) {
  const [form, setForm] = useState({ title: "", description: "", category: categories[0].name, severity: "medium", locationText: "", landmark: "" });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
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
