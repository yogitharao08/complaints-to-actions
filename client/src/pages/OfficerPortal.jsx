import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useComplaintList } from "../hooks/useComplaintList.js";
import { useComplaintDetail } from "../hooks/useComplaintDetail.js";
import { Shell } from "../components/common/Shell.jsx";
import { PageHeader } from "../components/common/PageHeader.jsx";
import { StatsCards } from "../components/common/StatsCards.jsx";
import { ListToolbar } from "../components/common/ListToolbar.jsx";
import { ComplaintTable } from "../components/complaints/ComplaintTable.jsx";
import { ComplaintDetail } from "../components/complaints/ComplaintDetail.jsx";
import { OfficerAction } from "../components/complaints/OfficerAction.jsx";
import { ProfilePage } from "../components/profile/ProfilePage.jsx";
import { EditProfilePage } from "../components/profile/EditProfilePage.jsx";
import { statusOptions } from "../utils/constants.js";

export function OfficerPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const [actionComplaint, setActionComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const pending = records.filter((item) => !["Resolved", "Closed"].includes(item.status));
  const visibleRecords = statusFilter ? records.filter((item) => item.status === statusFilter) : records;

  return (
    <Shell role="Officer" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title={`Officer Dashboard`} subtitle={`Logged in as ${user?.name || "Officer"}. Handle assigned complaints and update progress.`} />
          <StatsCards stats={[["Assigned", records.length], ["Pending", pending.length], ["Done", records.filter((item) => item.status === "Resolved").length]]} />
          <section className="analytics-grid">
            <article className="chart-card">
              <div className="chart-title"><BarChart3 size={18} /><h2>Status Overview</h2></div>
              <div className="bar-list">
                {statusOptions.map((status) => {
                  const count = records.filter((item) => item.status === status).length;
                  return (
                    <div className="bar-row" key={status}>
                      <span>{status}</span>
                      <div><i style={{ width: `${Math.max(4, (count / Math.max(1, records.length)) * 100)}%` }} /></div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
          <ComplaintTable title="Assigned Complaints" rows={visibleRecords} loading={loading} onView={openComplaint} onAction={setActionComplaint} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        </>
      )}
      {active === "Assigned Complaints" && (
        <>
          <ListToolbar title="Assigned Complaints" search={search} setSearch={setSearch} />
          <ComplaintTable rows={visibleRecords} loading={loading} onView={openComplaint} onAction={setActionComplaint} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        </>
      )}
      {active === "Profile" && <ProfilePage user={user} role="Officer" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Officer" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} />}
      {actionComplaint && <OfficerAction complaint={actionComplaint} onClose={() => setActionComplaint(null)} onSaved={async () => {
        setActionComplaint(null);
        await refresh();
      }} />}
    </Shell>
  );
}
