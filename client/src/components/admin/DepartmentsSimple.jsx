import React, { useEffect, useState } from "react";
import { listDepartments, saveDepartmentRecord } from "../../api.js";
import { DepartmentEditModal } from "./DepartmentEditModal.jsx";

export function DepartmentsSimple({ records }) {
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
