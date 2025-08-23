import React, { useMemo, useState } from "react";
import "./styles.css";
import SlopeCardRow from "./components/SlopeCardRow";
import SectorSmallMultiples from "./components/SectorSmallMultiples";
import RegionCardsGrid from "./components/RegionCardsGrid";
import SdgWaffleGrid from "./components/SdgWaffleGrid";
import { Tabs } from "./components/Tabs";
import {
  headline as headlineAll,
  sectors,
  regions,
  sdgs,
  YEAR,
} from "./data/mock";
import CatalyticLeverageRings from "./components/CatalyticLeverageRings";
import IntraAfricanShareMeter from "./components/IntraAfricanShareMeter";
import { leverageItems, intraShareItems } from "./data/mock";
import type { HeadlineMetricDatum } from "./types";
import LegendDelta from "./components/LegendDelta";
import SectionHeader from "./components/SectionHeader";

export default function App() {
  const [year, setYear] = useState(YEAR);
  const [comparePrev, setComparePrev] = useState(true);
  const [activeTab, setActiveTab] = useState<"sector" | "region" | "sdg">(
    "sector"
  );

  const headline = useMemo<HeadlineMetricDatum[]>(() => {
    if (comparePrev) return headlineAll;
    return headlineAll.map((d) => ({ ...d, previous: d.current }));
  }, [comparePrev]);

  return (
    <div className="container">
      <h1 className="title">Development Impact Dashboard</h1>
      <p className="subtitle">
        Aligned indicators (Headline, Sector, Region, SDGs).
      </p>

      <div className="hstack" style={{ gap: 12, marginBottom: 12 }}>
        <label className="hstack" style={{ gap: 6 }}>
          <span className="caption">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            <option>{YEAR}</option>
            <option>{YEAR - 1}</option>
          </select>
        </label>
        <label className="hstack" style={{ gap: 6 }}>
          <input
            type="checkbox"
            checked={comparePrev}
            onChange={(e) => setComparePrev(e.target.checked)}
          />
          <span className="caption">Compare to previous year</span>
        </label>
      </div>

      <LegendDelta showFamilies />
      <SlopeCardRow data={headline} />

      <hr className="sep" />

      <Tabs
        tabs={[
          {
            id: "sector",
            title: "Impact by Sector",
            content: (
              <>
              <SectionHeader title="Impact by Sector" helpKey="impactBySector" />
                <p className="caption">
                  Total Disbursement ($M), Projects, Jobs per $1M.
                </p>
                <SectorSmallMultiples sectors={sectors} />
              </>
            ),
          },
          {
            id: "region",
            title: "Impact by Region",
            content: (
              <>
              <SectionHeader title="Impact by Region" helpKey="impactByRegion" />
                <p className="caption">
                  Intra-African Trade, Manufactured Exports, SMEs, Jobs,
                  Disbursement.
                </p>
                <RegionCardsGrid regions={regions} />
              </>
            ),
          },
          {
            id: "sdg",
            title: "SDG Contribution",
            content: (
              <>
              <SectionHeader title="SDG Contribution" helpKey="sdgContribution" />
                <p className="caption">Top 9 SDGs</p>
                <SdgWaffleGrid stats={sdgs} />
              </>
            ),
          },
          {
            id: "insights",
            title: "Insights",
            content: (
              <>
                 <SectionHeader title="Catalytic Leverage" helpKey="catalyticLeverage" />
                <CatalyticLeverageRings items={leverageItems} />
                <div style={{ height: 12 }} />
                <SectionHeader title="Intra-African Trade Share" helpKey="intraAfricanTradeShare" />
                <IntraAfricanShareMeter items={intraShareItems} />
              </>
            ),
          },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
