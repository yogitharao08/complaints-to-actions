export const categories = [
  { name: "Sanitation", icon: "Trash2", description: "Waste collection, drainage and street cleaning." },
  { name: "Water Supply", icon: "Droplets", description: "Leaks, pressure issues and quality reports." },
  { name: "Electricity", icon: "Zap", description: "Street lighting and power outages." },
  { name: "Public Roads", icon: "Construction", description: "Potholes, road damage and unsafe crossings." }
];

export const complaints = [
  {
    id: "CTA-2026-000123",
    title: "Large pothole forming at intersection of 5th and Main",
    shortTitle: "Pothole on 5th and Main",
    category: "Public Roads",
    status: "In Progress",
    severity: "high",
    location: "5th and Main, Ward 4",
    filed: "May 19, 2026",
    sla: "9h remaining",
    citizen: "James Walker",
    officer: "Officer Sharma",
    timeline: [
      ["Complaint Filed", "May 19, 2026 - 09:15 AM"],
      ["Assigned to Department", "Public Roads Division"],
      ["In Progress", "Field verification initiated"]
    ]
  },
  {
    id: "CTA-2026-000124",
    title: "Street light outage beside old town bridge",
    shortTitle: "Street Light Outage",
    category: "Electricity",
    status: "Resolved",
    severity: "medium",
    location: "Old Town Bridge, Ward 12",
    filed: "May 17, 2026",
    sla: "Completed",
    citizen: "James Walker",
    officer: "Electricity Grid"
  },
  {
    id: "CTA-2026-000125",
    title: "Illegal garbage dumping in market square",
    shortTitle: "Illegal Garbage Dumping",
    category: "Sanitation",
    status: "Submitted",
    severity: "medium",
    location: "Market Square East, Ward 8",
    filed: "May 20, 2026",
    sla: "22h remaining",
    citizen: "James Walker",
    officer: "Pending assignment"
  },
  {
    id: "CTA-2026-000126",
    title: "Water leakage flooding block G",
    shortTitle: "Water Leak on Block G",
    category: "Water Supply",
    status: "Escalated",
    severity: "critical",
    location: "North Sector, Block G",
    filed: "May 18, 2026",
    sla: "Expired",
    citizen: "James Walker",
    officer: "Water Supply Head"
  }
];

export const departments = [
  { name: "Sanitation & Waste", total: 318, resolved: 92 },
  { name: "Public Roads", total: 284, resolved: 74 },
  { name: "Water Supply", total: 176, resolved: 88 },
  { name: "Electricity Grid", total: 139, resolved: 61 }
];
