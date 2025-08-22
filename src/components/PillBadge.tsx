import React from "react";

export function PillBadge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}
