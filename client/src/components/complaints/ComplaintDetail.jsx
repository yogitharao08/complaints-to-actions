import React, { useState } from "react";
import { Modal } from "../common/Modal.jsx";
import { StatusChip } from "../common/StatusChip.jsx";
import { ProofPreview } from "./ProofPreview.jsx";
import { assignmentOptions } from "../../utils/constants.js";

export function ComplaintDetail({ complaint, onClose, onCitizenDecision, onAdminReassign }) {
  const [reopenReason, setReopenReason] = useState("");
  const [assignment, setAssignment] = useState(complaint.departmentId || "dept-roads");
  const timeline = complaint.timeline || [];
  const canVerify = onCitizenDecision && complaint.status === "Resolved";
  const selectedAssignment = assignmentOptions.find(([departmentId]) => departmentId === assignment) || assignmentOptions[0];

  return (
    <Modal title={complaint.id} onClose={onClose}>
      <div className="detail-modal">
        <div className="split-row"><h2>{complaint.title}</h2><StatusChip status={complaint.status} /></div>
        {complaint.loadingDetail && <p>Loading latest officer updates...</p>}
        <p>{complaint.description || "No description available."}</p>
        <div className="info-grid">
          <div><small>Category</small><p>{complaint.category}</p></div>
          <div><small>Severity</small><p>{complaint.severity || "medium"}</p></div>
          <div><small>Location</small><p>{complaint.location}</p></div>
          <div><small>Officer / Queue</small><p>{complaint.officer}</p></div>
        </div>
        {complaint.mediaUrls?.length > 0 && (
          <>
            <h3>Citizen Evidence</h3>
            <div className="proof-list">
              {complaint.mediaUrls.map((proof, index) => <ProofPreview proof={proof} key={`${proof}-${index}`} />)}
            </div>
          </>
        )}
        {complaint.proofUrls?.length > 0 && (
          <>
            <h3>Proof</h3>
            <div className="proof-list">
              {complaint.proofUrls.map((proof, index) => <ProofPreview proof={proof} key={`${proof}-${index}`} />)}
            </div>
          </>
        )}
        <h3>Simple Flow</h3>
        <div className="simple-flow">
          {["Submitted", "Assigned", "In Progress", "Resolved", "Closed"].map((step) => <span className={step === complaint.status ? "current" : ""} key={step}>{step}</span>)}
        </div>
        <h3>Officer Updates</h3>
        <div className="update-list">
          {timeline.length === 0 && <p>No officer updates yet.</p>}
          {timeline.map(([status, message], index) => (
            <article className="update-item" key={`${status}-${index}`}>
              <strong>{status}</strong>
              <p>{message}</p>
            </article>
          ))}
        </div>
        {canVerify && (
          <div className="citizen-verification">
            <h3>Citizen Verification</h3>
            <p>Review the officer update and choose whether the issue is fixed.</p>
            <div className="button-row">
              <button className="primary" onClick={() => onCitizenDecision({ type: "close" })}>Accept & Close</button>
            </div>
            <label>Reopen reason<textarea value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} placeholder="Explain what is still unresolved." /></label>
            <button className="outline" onClick={() => {
              if (!reopenReason.trim()) {
                alert("Please enter a reopen reason.");
                return;
              }
              onCitizenDecision({ type: "reopen", reason: reopenReason });
            }}>Reopen Complaint</button>
          </div>
        )}
        {onAdminReassign && (
          <div className="citizen-verification">
            <h3>Admin Reassignment</h3>
            <label>Department / Officer<select value={assignment} onChange={(event) => setAssignment(event.target.value)}>{assignmentOptions.map(([departmentId, , label]) => <option key={departmentId} value={departmentId}>{label}</option>)}</select></label>
            <button className="primary" onClick={() => onAdminReassign({ departmentId: selectedAssignment[0], assignedOfficerId: selectedAssignment[1] })}>Reassign Complaint</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
