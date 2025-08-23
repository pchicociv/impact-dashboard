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
  | "subLoansToSMEs";

export type HelpTopicKey =
  | "impactBySector"
  | "impactByRegion"
  | "sdgContribution"
  | "catalyticLeverage"
  | "intraAfricanTradeShare"
  | "governmentRevenueMultiplier"; 

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
