import React from "react";
import { StatusChip } from "../common/StatusChip.jsx";
import { statusOptions } from "../../utils/constants.js";

export function ComplaintTable({ title = "Complaints", rows, loading, onView, onAction, statusFilter, setStatusFilter }) {
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
