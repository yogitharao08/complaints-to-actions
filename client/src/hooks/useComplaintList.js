import { useEffect, useState } from "react";
import { listComplaints } from "../api.js";

export function useComplaintList() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const data = await listComplaints({ search });
    setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [search]);

  return { records, search, setSearch, loading, refresh };
}
