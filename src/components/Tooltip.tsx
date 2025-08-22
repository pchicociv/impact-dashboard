import React from "react";

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span title={label} style={{ cursor: "help", borderBottom: "1px dotted var(--muted)" }}>
      {children}
    </span>
  );
}
