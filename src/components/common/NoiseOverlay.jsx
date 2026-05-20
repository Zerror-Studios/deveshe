import React from "react";

export default function NoiseOverlay({ className = "" }) {
  return (
    <div
      className={className ? `noise ${className}` : "noise"}
      aria-hidden="true"
    />
  );
}
