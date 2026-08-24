import React from "react";

export function PageHeader({ title, subtitle, right }) {
  return (
    <section className="page-head simple-head">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {right}
    </section>
  );
}
