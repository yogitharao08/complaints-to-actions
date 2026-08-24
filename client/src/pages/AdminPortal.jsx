import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getReportOverview, updateComplaintAssignment } from "../api.js";
import { useComplaintList } from "../hooks/useComplaintList.js";
import { useComplaintDetail } from "../hooks/useComplaintDetail.js";
import { Shell } from "../components/common/Shell.jsx";
import { PageHeader } from "../components/common/PageHeader.jsx";
import { StatsCards } from "../components/common/StatsCards.jsx";
import { ListToolbar } from "../components/common/ListToolbar.jsx";
import { ComplaintTable } from "../components/complaints/ComplaintTable.jsx";
import { ComplaintDetail } from "../components/complaints/ComplaintDetail.jsx";
import { AnalyticsCharts } from "../components/analytics/AnalyticsCharts.jsx";
import { UsersSimple } from "../components/admin/UsersSimple.jsx";
import { DepartmentsSimple } from "../components/admin/DepartmentsSimple.jsx";
import { ProfilePage } from "../components/profile/ProfilePage.jsx";
import { EditProfilePage } from "../components/profile/EditProfilePage.jsx";
import { exportComplaints } from "../utils/helpers.js";

export function AdminPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const [report, setReport] = useState(null);
  const done = records.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
  const pending = records.length - done;

  useEffect(() => {
    getReportOverview().then(setReport).catch(() => setReport(null));
  }, [records.length]);

  return (
    <Shell role="Admin" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title="Admin Dashboard" subtitle="Monitor all complaints, pending work, resolved cases, users, and departments." right={<button className="outline" onClick={() => exportComplaints(records)}><Download size={16} /> Export CSV</button>} />
          <StatsCards stats={[["All Complaints", records.length], ["Pending", pending], ["Done", done], ["Escalated", records.filter((item) => item.status === "Escalated").length]]} />
          <AnalyticsCharts report={report} records={records} />
          <ComplaintTable title="All Complaints" rows={records.slice(0, 8)} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "All Complaints" && (
        <>
          <ListToolbar title="All Complaints" search={search} setSearch={setSearch} right={<button className="outline" onClick={() => exportComplaints(records)}><Download size={16} /> Export CSV</button>} />
          <ComplaintTable rows={records} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "Users" && <UsersSimple />}
      {active === "Departments" && <DepartmentsSimple records={records} />}
      {active === "Profile" && <ProfilePage user={user} role="Admin" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Admin" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} onAdminReassign={async (assignment) => {
        await updateComplaintAssignment(selected.id, assignment.departmentId, assignment.assignedOfficerId, "Admin reassigned complaint.");
        setSelected(null);
        await refresh();
      }} />}
    </Shell>
  );
}
