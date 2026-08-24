import React from "react";

export function StatusChip({ status = "Submitted" }) {
  return <span className={`status status-${status.toLowerCase().replace(/\s/g, "-")}`}>{status}</span>;
}
