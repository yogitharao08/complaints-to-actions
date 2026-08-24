import React from "react";
import { FileText } from "lucide-react";

export function StatsCards({ stats }) {
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
