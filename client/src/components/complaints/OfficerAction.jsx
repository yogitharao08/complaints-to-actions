import React, { useState } from "react";
import { Modal } from "../common/Modal.jsx";
import { updateComplaintStatus, uploadFile } from "../../api.js";
import { statusOptions } from "../../utils/constants.js";

export function OfficerAction({ complaint, onClose, onSaved }) {
  const [status, setStatus] = useState(complaint.status === "Submitted" ? "Assigned" : "In Progress");
  const [comment, setComment] = useState("");
  const [proof, setProof] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileProof, setFileProof] = useState("");
  const [uploading, setUploading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (status === "Resolved" && !proof && !fileName) {
      alert("Please add proof before resolving.");
      return;
    }
    await updateComplaintStatus(complaint.id, status, comment || `Officer marked complaint as ${status}.`, proof || fileProof || fileName ? [proof || fileProof || fileName] : []);
    await onSaved();
  }

  return (
    <Modal title={`Update ${complaint.id}`} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <h2>{complaint.title}</h2>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Officer note<textarea value={comment} onChange={(event) => setComment(event.target.value)} /></label>
        <label>Proof URL<input value={proof} onChange={(event) => setProof(event.target.value)} placeholder="Required when resolving" /></label>
        <label>Upload proof<input type="file" accept="image/*,video/*,.pdf" onChange={async (event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name || "");
          if (!file) {
            setFileProof("");
            return;
          }
          setUploading(true);
          try {
            const uploaded = await uploadFile(file);
            setFileProof(uploaded.url);
          } catch (error) {
            alert(error.response?.data?.message || "File upload failed.");
            setFileName("");
          } finally {
            setUploading(false);
          }
        }} /></label>
        {fileName && <p className="success-message">{uploading ? `Uploading ${fileName}...` : `${fileName} uploaded`}</p>}
        <div className="button-row"><button className="outline" type="button" onClick={onClose}>Cancel</button><button className="primary" disabled={uploading} type="submit">Save Update</button></div>
      </form>
    </Modal>
  );
}
