import React from "react";
import HeadlineMetricSlopeCard from "./HeadlineMetricSlopeCard";
import type { HeadlineMetricDatum } from "../types";

export default function SlopeCardRow({ data }: { data: HeadlineMetricDatum[] }) {
  return <div className="row">{data.map(d => <HeadlineMetricSlopeCard key={d.key} d={d} />)}</div>;
}
