import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { ThemeToggle } from "../components/common/ThemeToggle.jsx";

export function LandingPage({ theme, onThemeChange }) {
  const navigate = useNavigate();
  const highlights = [
    ["Simple Citizen Filing", "Citizens submit complaints with category, location, severity, and evidence."],
    ["Department Routing", "Complaints are routed to the officer responsible for the selected department."],
    ["Proof-Based Resolution", "Officers add updates and proof before marking complaints as resolved."],
    ["Admin Oversight", "Admins monitor all pending and completed work, users, departments, and reports."]
  ];
  const flow = ["Citizen files complaint", "System assigns department", "Officer updates progress", "Citizen verifies resolution", "Admin monitors everything"];

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <button className="landing-brand" onClick={() => navigate("/")} type="button">
          <Building2 size={28} />
          <span>Complaint to Action</span>
        </button>
        <div className="landing-nav-actions">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          <button className="primary" onClick={() => navigate("/login")} type="button">Login</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <small>Civic grievance and resolution platform</small>
          <h1>Turn public complaints into trackable action.</h1>
          <p>
            Complaint to Action helps citizens file grievances, routes each complaint to the right department,
            gives officers a clear work queue, and lets admins monitor resolution progress from one place.
          </p>
          <div className="landing-actions">
            <button className="primary" onClick={() => navigate("/login")} type="button">File a Complaint <ArrowRight size={18} /></button>
            <button className="outline" onClick={() => navigate("/login")} type="button">Open Portal</button>
          </div>
        </div>
        <div className="landing-panel" aria-label="Complaint workflow preview">
          <div className="landing-ticket-head">
            <span className="status status-assigned">Assigned</span>
            <strong>CTA-2026-000123</strong>
          </div>
          <h2>Water leakage near Ward 4 market</h2>
          <p>Assigned to Water Supply department with SLA tracking, officer updates, proof upload, and citizen verification.</p>
          <div className="landing-flow-preview">
            {["Submitted", "Assigned", "In Progress", "Resolved"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-title">
          <small>What the app does</small>
          <h2>A simple grievance flow for citizens, officers, and admins.</h2>
        </div>
        <div className="landing-feature-grid">
          {highlights.map(([title, text]) => (
            <article className="landing-feature" key={title}>
              <CheckCircle2 size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-flow-section">
        <div className="section-title">
          <small>Lifecycle</small>
          <h2>Every complaint has a visible path from filing to closure.</h2>
        </div>
        <div className="landing-flow">
          {flow.map((item, index) => (
            <div className="landing-flow-step" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-portals">
        <article>
          <UserRound size={24} />
          <h3>Citizen Portal</h3>
          <p>Create complaints, view timelines, see officer messages, preview proof, reopen unresolved work, and manage profile details.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
        <article>
          <ShieldCheck size={24} />
          <h3>Officer Portal</h3>
          <p>Department officers see only their assigned department complaints, update statuses, add notes, and upload resolution proof.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
        <article>
          <Building2 size={24} />
          <h3>Admin Portal</h3>
          <p>Admins manage users and departments, reassign complaints, view pending and resolved work, and export reports.</p>
          <button className="soft" onClick={() => navigate("/login")} type="button">Login</button>
        </article>
      </section>
    </main>
  );
}
