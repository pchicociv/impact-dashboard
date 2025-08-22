import React, { useMemo, useState } from "react";
import "./styles.css";
import SlopeCardRow from "./components/SlopeCardRow";
import SectorSmallMultiples from "./components/SectorSmallMultiples";
import AfricaTileMap from "./components/AfricaTileMap";
import SdgWaffleGrid from "./components/SdgWaffleGrid";
import { Tabs } from "./components/Tabs";
import { headline as headlineAll, sectors, regions, sdgs, YEAR } from "./data/mock";
import type { HeadlineMetricDatum } from "./types";

export default function App() {
  const [year, setYear] = useState(YEAR);
  const [comparePrev, setComparePrev] = useState(true);
  const [activeTab, setActiveTab] = useState<"sector" | "region" | "sdg">("sector");

  const headline = useMemo<HeadlineMetricDatum[]>(() => {
    if (comparePrev) return headlineAll;
    return headlineAll.map(d => ({ ...d, previous: d.current }));
  }, [comparePrev]);

  return (
    <div className="container">
      <h1 className="title">Development Impact Dashboard</h1>
      <p className="subtitle">Aligned with Afreximbank indicators (Headline, Sector, Region, SDGs).</p>

      <div className="hstack" style={{ gap: 12, marginBottom: 12 }}>
        <label className="hstack" style={{ gap: 6 }}>
          <span className="caption">Year</span>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            <option>{YEAR}</option>
            <option>{YEAR - 1}</option>
          </select>
        </label>
        <label className="hstack" style={{ gap: 6 }}>
          <input type="checkbox" checked={comparePrev} onChange={e => setComparePrev(e.target.checked)} />
          <span className="caption">Compare to previous year</span>
        </label>
      </div>

      <SlopeCardRow data={headline} />
      <p className="caption">
        Metric labels & units mirror your template (e.g., “Total Amount Disbursed (US$)”, “Manufactured Exports Facilitated (US$)”, “Jobs Created/Sustained”).
      </p>

      <hr className="sep" />

      <Tabs
        tabs={[
          {
            id: "sector",
            title: "Impact by Sector",
            content: (
              <>
                <p className="caption">Total Disbursement ($M), Projects (unit strip), Jobs per $1M.</p>
                <SectorSmallMultiples sectors={sectors} />
              </>
            )
          },
          {
            id: "region",
            title: "Impact by Region",
            content: (
              <>
                <p className="caption">Intra-African Trade, Manufactured Exports, SMEs, Jobs, Disbursement.</p>
                <AfricaTileMap regions={regions} />
              </>
            )
          },
          {
            id: "sdg",
            title: "SDG Contribution",
            content: (
              <>
                <p className="caption">Top 9 SDGs as 10×10 waffle grids.</p>
                <SdgWaffleGrid stats={sdgs} />
              </>
            )
          }
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
