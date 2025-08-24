export type Year = number;

export type HeadlineMetricKey =
  | "totalAmountDisbursed"
  | "investmentAttracted"
  | "projectsFundedTotal"
  | "projectsFundedNew"
  | "projectsFundedExisting"
  | "intraAfricanTradeFacilitated"
  | "manufacturedExportsFacilitated"
  | "paymentServicesAccessingEntities"
  | "smesConnectedToMarkets"
  | "banksOnboarded"
  | "jobsCreatedSustained"
  | "peopleBenefited"
  | "subLoansToSMEs"
  | "localContent";

export type HelpTopicKey =
  | "impactBySector"
  | "impactByRegion"
  | "sdgContribution"
  | "catalyticLeverage"
  | "intraAfricanTradeShare"
  | "governmentRevenueMultiplier"
  | "smeParticipationFunnel"
  | "inclusiveJobs";

export interface HeadlineMetricDatum {
  key: HeadlineMetricKey;
  label: string;
  unit: "US$" | "count";
  current: number;
  previous: number;
  history?: { year: Year; value: number }[];
  family: "money" | "projects" | "trade" | "jobs";
}

export interface SectorImpact {
  sector: string;
  totalDisbursementM: number; // $M
  numberOfProjects: number;
  jobsCreated: number; // count
}

export interface RegionImpact {
  region:
    | "West Africa"
    | "North Africa"
    | "Central Africa"
    | "Southern Africa"
    | "East Africa";
  totalDisbursementM: number; // $M
  projects: number;
  intraAfricanTradeUS: number; // US$
  manufacturedExportsUS: number; // US$
  smesSupported: number; // count
  jobsCreated: number; // count
}

export interface SdgStat {
  sdg: string; // "SDG 7 — Affordable & Clean Energy"
  percentOfProjects: number; // 0..100
  exampleProject?: string;
}

// types.ts
export type SmeStage = 'eligible' | 'approved' | 'disbursed' | 'active';

export interface SmeFunnelItem {
  stage: SmeStage;
  total: number;          // total SMEs at this stage
  womenLed?: number;      // count of women-led SMEs at this stage
  youthLed?: number;      // count of youth-led SMEs at this stage
}

// Inclusive Employment small-multiple item
export interface JobsByDemoItem {
  scopeId: string;       // e.g., sector code or region code
  scopeName: string;     // e.g., "Manufacturing" or "West Africa"
  total: number;         // total jobs (FTE)
  women: number;         // jobs held by women (subset of total)
  youth: number;         // jobs held by youth (18–35, subset of total; overlaps men/women)
  period?: string;       // optional label like "FY2025" or "Jan–Dec 2025"
}

/** Local Content time-series point (Domestic vs Imported inputs) */
export interface LocalContentPoint {
  t: string | number;     // e.g., 2021, "Q1-2025"
  domesticUS: number;     // US$
  importedUS: number;     // US$
}