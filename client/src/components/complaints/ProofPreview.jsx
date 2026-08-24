import React from "react";

export function ProofPreview({ proof }) {
  const value = String(proof || "");
  const [name, type, dataUrl] = value.split("|");
  const isData = dataUrl?.startsWith("data:");
  const isUrl = value.startsWith("http");
  const lower = value.toLowerCase();
  const isImageUrl = isUrl && /\.(png|jpe?g|gif|webp|bmp)$/i.test(lower);
  const isVideoUrl = isUrl && /\.(mp4|webm|ogg|mov)$/i.test(lower);
  const label = isData ? name : value;

  if (isData && type?.startsWith("image/")) {
    return <div className="proof-item"><img src={dataUrl} alt={name} /><a href={dataUrl} download={name}>{name}</a></div>;
  }

  if (isData && type?.startsWith("video/")) {
    return <div className="proof-item"><video src={dataUrl} controls /><a href={dataUrl} download={name}>{name}</a></div>;
  }

  if (isData) {
    return <a className="proof-link" href={dataUrl} download={name}>{name}</a>;
  }

  if (isUrl) {
    if (isImageUrl) return <div className="proof-item"><img src={value} alt="Uploaded proof" /><a href={value} target="_blank" rel="noreferrer">Open proof</a></div>;
    if (isVideoUrl) return <div className="proof-item"><video src={value} controls /><a href={value} target="_blank" rel="noreferrer">Open proof</a></div>;
    return <a className="proof-link" href={value} target="_blank" rel="noreferrer">{value}</a>;
  }

  return <div className="proof-link">{label || "Proof attached"}</div>;
}
