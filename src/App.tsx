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

  // Headline strip — show all (already grouped by your doc’s “Key Indicator” list)
  const headline = useMemo<HeadlineMetricDatum[]>(() => {
    if (comparePrev) return headlineAll; // here you’d slice/filter by year from API
    return headlineAll.map(d => ({ ...d, previous: d.current })); // no-op when compare off
  }, [comparePrev]);

  return (
    <div className="container">
      <h1 className="title">Development Impact Dashboard</h1>
      <p className="subtitle">
        Aligned with Afreximbank’s dashboard sections and indicators (Headline, Sector, Region, SDGs). {/* cites below */}
      </p>

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

      {/* Headline Impact Metrics (FlowingData-style slope/dumbbell cards) */}
      <SlopeCardRow data={headline} />
      <p className="caption">
        Metric labels & units mirror your template (e.g., “Total Amount Disbursed (US$)”, “Manufactured Exports Facilitated (US$)”, “Jobs Created/Sustained”). :contentReference[oaicite:5]{index=5}
      </p>

      <hr className="sep" />

      <Tabs
        activeId="sector"
        onChange={() => {}}
        tabs={[
          {
            id: "sector",
            title: "Impact by Sector",
            content: (
              <>
                <p className="caption">
                  Shows Total Disbursement ($M), Projects (unit strip), and Jobs per $1M for each sector listed in your spec. :contentReference[oaicite:6]{index=6}
                </p>
                <SectorSmallMultiples sectors={sectors} />
              </>
            )
          },
          {
            id: "region",
            title: "Impact by Region",
            content: (
              <>
                <p className="caption">
                  Five subregions with intra-African trade, manufactured exports, SMEs supported, jobs, and disbursement—exactly as in your template. :contentReference[oaicite:7]{index=7}
                </p>
                <AfricaTileMap regions={regions} />
              </>
            )
          },
          {
            id: "sdg",
            title: "SDG Contribution",
            content: (
              <>
                <p className="caption">
                  Top 9 SDGs as 10×10 waffle grids (% of projects + example project). :contentReference[oaicite:8]{index=8}
                </p>
                <SdgWaffleGrid stats={sdgs} />
              </>
            )
          }
        ]}
      />
    </div>
  );
}
