import { HeadlineMetricDatum, SectorImpact, RegionImpact, SdgStat } from "../types";

export const YEAR = 2025;

export const headline: HeadlineMetricDatum[] = [
  { key: "totalAmountDisbursed", label: "Total Amount Disbursed (US$)", unit: "US$", current: 1_240_000_000, previous: 1_400_000_000, family: "money" },
  { key: "investmentAttracted", label: "Investment attracted from within and outside Africa (US$)", unit: "US$", current: 2_300_000_000, previous: 2_000_000_000, family: "money" },
  { key: "projectsFundedTotal", label: "Total number of Projects Funded", unit: "count", current: 120, previous: 105, family: "projects" },
  { key: "projectsFundedNew", label: "New Projects Funded", unit: "count", current: 55, previous: 49, family: "projects" },
  { key: "projectsFundedExisting", label: "Existing Projects Funded", unit: "count", current: 65, previous: 56, family: "projects" },
  { key: "intraAfricanTradeFacilitated", label: "Intra-African Trade Facilitated (US$)", unit: "US$", current: 880_000_000, previous: 750_000_000, family: "trade" },
  { key: "manufacturedExportsFacilitated", label: "Manufactured Exports Facilitated (US$)", unit: "US$", current: 510_000_000, previous: 470_000_000, family: "trade" },
  { key: "paymentServicesAccessingEntities", label: "African Entities Accessing Payment Services", unit: "count", current: 420, previous: 350, family: "projects" },
  { key: "smesConnectedToMarkets", label: "African SMEs Connected to Markets", unit: "count", current: 290, previous: 240, family: "projects" },
  { key: "banksOnboarded", label: "African Banks Onboarded", unit: "count", current: 65, previous: 55, family: "projects" },
  { key: "jobsCreatedSustained", label: "Jobs Created/Sustained", unit: "count", current: 48_500, previous: 44_000, family: "jobs" },
  { key: "peopleBenefited", label: "People Benefited", unit: "count", current: 320_000, previous: 280_000, family: "jobs" },
  { key: "subLoansToSMEs", label: "Sub Loans to SMEs", unit: "count", current: 1_850, previous: 1_530, family: "projects" }
];

export const sectors: SectorImpact[] = [
  { sector: "Manufacturing", totalDisbursementM: 420, numberOfProjects: 28, jobsCreated: 15000 },
  { sector: "Creatives", totalDisbursementM: 75, numberOfProjects: 12, jobsCreated: 2200 },
  { sector: "Financial Intermediaries", totalDisbursementM: 300, numberOfProjects: 18, jobsCreated: 3500 },
  { sector: "Power", totalDisbursementM: 240, numberOfProjects: 10, jobsCreated: 6000 },
  { sector: "Mining", totalDisbursementM: 110, numberOfProjects: 6, jobsCreated: 1200 },
  { sector: "Oil & Gas", totalDisbursementM: 90, numberOfProjects: 4, jobsCreated: 800 },
  { sector: "Construction", totalDisbursementM: 130, numberOfProjects: 9, jobsCreated: 2600 },
  { sector: "Services", totalDisbursementM: 160, numberOfProjects: 14, jobsCreated: 4100 },
  { sector: "Railway", totalDisbursementM: 85, numberOfProjects: 3, jobsCreated: 700 },
  { sector: "Agriculture", totalDisbursementM: 230, numberOfProjects: 17, jobsCreated: 9200 },
  { sector: "Other", totalDisbursementM: 60, numberOfProjects: 5, jobsCreated: 500 }
];

export const regions: RegionImpact[] = [
  { region: "West Africa", totalDisbursementM: 450, projects: 34, intraAfricanTradeUS: 320_000_000, manufacturedExportsUS: 180_000_000, smesSupported: 620, jobsCreated: 14000 },
  { region: "North Africa", totalDisbursementM: 310, projects: 22, intraAfricanTradeUS: 210_000_000, manufacturedExportsUS: 120_000_000, smesSupported: 380, jobsCreated: 9600 },
  { region: "Central Africa", totalDisbursementM: 160, projects: 12, intraAfricanTradeUS: 90_000_000, manufacturedExportsUS: 60_000_000, smesSupported: 210, jobsCreated: 4200 },
  { region: "Southern Africa", totalDisbursementM: 380, projects: 26, intraAfricanTradeUS: 260_000_000, manufacturedExportsUS: 150_000_000, smesSupported: 470, jobsCreated: 12800 },
  { region: "East Africa", totalDisbursementM: 310, projects: 25, intraAfricanTradeUS: 210_000_000, manufacturedExportsUS: 130_000_000, smesSupported: 450, jobsCreated: 10900 }
];

export const sdgs: SdgStat[] = [
  { sdg: "SDG 1 — No poverty", percentOfProjects: 38, exampleProject: "SME credit line (multi-country)" },
  { sdg: "SDG 2 — Zero Hunger", percentOfProjects: 22, exampleProject: "Agri-processing facility" },
  { sdg: "SDG 3 — Good Health & Well Being", percentOfProjects: 12, exampleProject: "Pharma manufacturing" },
  { sdg: "SDG 5 — Gender Equality", percentOfProjects: 27, exampleProject: "Women-headed SME financing" },
  { sdg: "SDG 7 — Affordable & Clean Energy", percentOfProjects: 19, exampleProject: "Solar IPP" },
  { sdg: "SDG 8 — Decent Work & Economic Growth", percentOfProjects: 64, exampleProject: "Industrial park expansion" },
  { sdg: "SDG 9 — Industry, Innovation & Infrastructure", percentOfProjects: 55, exampleProject: "Rail logistics upgrade" },
  { sdg: "SDG 13 — Climate Action", percentOfProjects: 16, exampleProject: "Energy efficiency retrofit" },
  { sdg: "SDG 17— Partnership for the Goals", percentOfProjects: 41, exampleProject: "Pan-African trade platform" }
];
