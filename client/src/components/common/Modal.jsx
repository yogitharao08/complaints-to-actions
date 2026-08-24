import React from "react";

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head"><h2>{title}</h2><button className="ghost" onClick={onClose}>Close</button></div>
        {children}
      </div>
    </div>
  );
}
