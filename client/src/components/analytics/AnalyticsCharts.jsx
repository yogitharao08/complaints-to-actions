import React from "react";
import { BarChart3, Building2 } from "lucide-react";
import { statusOptions } from "../../utils/constants.js";

export function AnalyticsCharts({ report, records }) {
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
