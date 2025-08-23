import React from "react";
import { useHelpDrawer } from "./HelpDrawer";
import type { HelpKey } from "../data/metricHelp";

export default function SectionHeader({ title, helpKey }: { title: string; helpKey: HelpKey }) {
  const { open } = useHelpDrawer();
  return (
    <div className="section-head">
      <h3 className="section-title">{title}</h3>
      <button className="icon-btn" aria-label={`About ${title}`} onClick={() => open(helpKey)}>?</button>
    </div>
  );
}
