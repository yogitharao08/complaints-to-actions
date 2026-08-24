import { useState } from "react";
import { getComplaintDetail } from "../api.js";

export function useComplaintDetail() {
  const [selected, setSelected] = useState(null);

  async function openComplaint(row) {
    setSelected({ ...row, loadingDetail: true });
    const detail = await getComplaintDetail(row.id || row._id);
    setSelected(detail || row);
  }

  return { selected, setSelected, openComplaint };
}
