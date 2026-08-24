export function exportComplaints(records) {
  const header = ["ID", "Title", "Category", "Location", "SLA", "Status"];
  const rows = records.map((item) => [item.id, item.title, item.category, item.location, item.sla, item.status].map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","));
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "complaints.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

export function fileToProof(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(`${file.name}|${file.type}|${reader.result}`);
    reader.onerror = () => reject(new Error("Could not read proof file."));
    reader.readAsDataURL(file);
  });
}
