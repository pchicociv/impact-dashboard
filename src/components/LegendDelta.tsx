import React from "react";

export default function LegendDelta({showFamilies = true }:{
    showFamilies?: boolean;
}) {
  return (
    <div aria-label="Legend: delta and metric families">
      <div className="legend">
       
        {showFamilies && (
          <div className="legend-col" aria-label="Metric families">
            <span className="legend-chip"><i className="legend-dot money" /> Money</span>
            <span className="legend-chip"><i className="legend-dot projects" /> Projects</span>
            <span className="legend-chip"><i className="legend-dot trade" /> Trade</span>
            <span className="legend-chip"><i className="legend-dot jobs" /> Jobs</span>
          </div>
        )}
      </div>
    </div>
  );
}
