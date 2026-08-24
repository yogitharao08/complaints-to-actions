import React, { useState } from "react";
import { Plus } from "lucide-react";
import { reopenComplaint, updateComplaintStatus } from "../api.js";
import { useComplaintList } from "../hooks/useComplaintList.js";
import { useComplaintDetail } from "../hooks/useComplaintDetail.js";
import { Shell } from "../components/common/Shell.jsx";
import { PageHeader } from "../components/common/PageHeader.jsx";
import { StatsCards } from "../components/common/StatsCards.jsx";
import { ListToolbar } from "../components/common/ListToolbar.jsx";
import { ComplaintTable } from "../components/complaints/ComplaintTable.jsx";
import { ComplaintFormCard } from "../components/complaints/ComplaintFormCard.jsx";
import { ComplaintDetail } from "../components/complaints/ComplaintDetail.jsx";
import { ProfilePage } from "../components/profile/ProfilePage.jsx";
import { EditProfilePage } from "../components/profile/EditProfilePage.jsx";

export function CitizenPortal({ user, setUser, onExit, theme, onThemeChange }) {
  const [active, setActive] = useState("Dashboard");
  const { records, search, setSearch, loading, refresh } = useComplaintList();
  const { selected, setSelected, openComplaint } = useComplaintDetail();
  const activeCount = records.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
  const resolvedNeedsReview = records.filter((item) => item.status === "Resolved").length;

  return (
    <Shell role="Citizen" active={active} setActive={setActive} onExit={onExit} theme={theme} onThemeChange={onThemeChange}>
      {active === "Dashboard" && (
        <>
          <PageHeader title={`Welcome, ${user?.name || "Citizen"}`} subtitle="File complaints and track their progress from one simple place." right={<button className="primary" onClick={() => setActive("File Complaint")}><Plus size={16} /> File Complaint</button>} />
          <StatsCards stats={[["Total Complaints", records.length], ["Active", activeCount], ["Resolved", records.filter((item) => item.status === "Resolved").length]]} />
          {resolvedNeedsReview > 0 && <section className="notice-card">You have {resolvedNeedsReview} resolved complaint(s) waiting for your accept/reopen decision.</section>}
          <ComplaintTable title="Recent Complaints" rows={records.slice(0, 5)} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "File Complaint" && <ComplaintFormCard existingComplaints={records} onCreated={async () => {
        await refresh();
        setActive("My Complaints");
      }} />}
      {active === "My Complaints" && (
        <>
          <ListToolbar title="My Complaints" search={search} setSearch={setSearch} />
          <ComplaintTable rows={records} loading={loading} onView={openComplaint} />
        </>
      )}
      {active === "Profile" && <ProfilePage user={user} role="Citizen" setActive={setActive} records={records} />}
      {active === "EditProfile" && <EditProfilePage user={user} role="Citizen" setActive={setActive} onUserUpdate={setUser} />}
      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} onCitizenDecision={async (decision) => {
        if (decision.type === "close") {
          await updateComplaintStatus(selected.id, "Closed", "Citizen accepted the resolution.");
        } else {
          await reopenComplaint(selected.id, decision.reason);
        }
        setSelected(null);
        await refresh();
      }} />}
    </Shell>
  );
}
