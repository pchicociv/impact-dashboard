import type { HeadlineMetricKey, HelpTopicKey } from "../types";

type Help = { title: string; what: string; why: string; how: string };

/* --- Headline metrics (you already had these; keep/edit freely) --- */
export const metricHelp: Record<HeadlineMetricKey, Help> = {
  totalAmountDisbursed: {
    title: "Total Amount Disbursed (US$)",
    what: "Sum of funds disbursed by Afreximbank for all active facilities within the selected period.",
    why: "Shows the scale of capital deployed and relates to leverage, pipeline execution and portfolio momentum.",
    how: "Left dot is previous period, right dot is current. A downward slope means lower disbursement; labels show exact amounts.",
  },
  investmentAttracted: {
    title: "Investment attracted from within and outside Africa (US$)",
    what: "Total third-party capital mobilized alongside Afreximbank financing in the selected period.",
    why: "Measures catalytic effect—how Afreximbank funding crowds in other investors.",
    how: "Bigger rise indicates stronger crowd-in. Pair with Catalytic Leverage for the other/bank ratio.",
  },
  projectsFundedTotal: {
    title: "Total number of Projects Funded",
    what: "Count of unique projects that received disbursement this period.",
    why: "Shows reach and activity volume beyond dollars.",
    how: "Up-slope = more projects; compare with disbursement to see intensity per project.",
  },
  projectsFundedNew: {
    title: "New Projects Funded",
    what: "Projects receiving first-time disbursement during the period.",
    why: "Signals pipeline growth and additionality.",
    how: "Read together with Existing Projects to see balance between new vs follow-on support.",
  },
  projectsFundedExisting: {
    title: "Existing Projects Funded",
    what: "Projects receiving additional disbursement on existing facilities.",
    why: "Shows execution on multi-tranche programs and portfolio support.",
    how: "If this rises while total projects is flat, average ticket per project may be increasing.",
  },
  intraAfricanTradeFacilitated: {
    title: "Intra-African Trade Facilitated (US$)",
    what: "Value of supported trade flows occurring within Africa.",
    why: "Tracks progress against the intra-African mandate and AfCFTA objectives.",
    how: "Up-slope = more intra-African value. See Region cards for where it occurs.",
  },
  manufacturedExportsFacilitated: {
    title: "Manufactured Exports Facilitated (US$)",
    what: "Value of manufactured goods exports supported by financed projects.",
    why: "Indicates export diversification and industrialization.",
    how: "Interpret with intra-African share to understand destination mix.",
  },
  paymentServicesAccessingEntities: {
    title: "African Entities Accessing Payment Services",
    what: "Unique African entities that used Afreximbank payment services.",
    why: "Reflects digital reach and network adoption.",
    how: "If available, pair with activation rate (active / onboarded) for quality of usage.",
  },
  smesConnectedToMarkets: {
    title: "African SMEs Connected to Markets",
    what: "SMEs receiving market linkage or export readiness support.",
    why: "Speaks to inclusion and last-mile impact.",
    how: "Track SMEs per $1M in the Sector view for efficiency.",
  },
  banksOnboarded: {
    title: "African Banks Onboarded",
    what: "Banks onboarded to Afreximbank platforms or programs.",
    why: "Expands distribution capacity and regional coverage.",
    how: "Consider together with payment services and intra-African trade for network effects.",
  },
  jobsCreatedSustained: {
    title: "Jobs Created/Sustained",
    what: "Direct and indirect jobs created or sustained by supported projects.",
    why: "Core development outcome within TDIA.",
    how: "Use jobs per $1M in Sector view for intensity; watch trend direction in this slope.",
  },
  peopleBenefited: {
    title: "People Benefited",
    what: "People gaining service access or improvements (e.g., power, transport, finance).",
    why: "Captures social reach beyond formal jobs.",
    how: "Combine with sector composition to interpret who is being reached.",
  },
  subLoansToSMEs: {
    title: "Sub Loans to SMEs",
    what: "Number of SME sub-loans disbursed via financial intermediaries.",
    why: "Indicates SME penetration from wholesale lines to retail outcomes.",
    how: "Compare with SMEs Supported to assess conversion.",
  },
};

/* --- Section topics (new) --- */
export const topicHelp: Record<HelpTopicKey, Help> = {
  impactBySector: {
    title: "Impact by Sector",
    what: "Compares sectors on three lenses: Total Disbursement (US$M), Number of Projects, and Jobs per US$1M.",
    why: "Reveals where capital is deployed, how many initiatives it touches, and how labour-intensive outcomes are.",
    how: "Bars share a common scale across sectors. Each small square ≈ 1 project (capped for display). The Jobs per US$1M figure is a quick efficiency ratio—look for sectors that deliver more jobs with comparable funding.",
  },
  impactByRegion: {
    title: "Impact by Region",
    what: "Shows Afreximbank’s footprint across subregions: Disbursement (US$M), Intra-African Trade (US$), Manufactured Exports (US$), SMEs supported, plus Projects and Jobs.",
    why: "Highlights geographic balance and alignment with intra-African trade and manufacturing mandates.",
    how: "All bars use consistent scales per metric. Read left→right in each card; the footer lines summarize projects and jobs—use them to balance volume vs outcomes.",
  },
  sdgContribution: {
    title: "SDG Contribution",
    what: "Percentage of projects tagged to each Sustainable Development Goal (top nine shown).",
    why: "Connects portfolio activity to development priorities (jobs, industry, climate, etc.).",
    how: "Each waffle grid is 10×10 (each square ≈ 1%). Sums across SDGs may exceed 100% because projects can contribute to multiple SDGs.",
  },
  catalyticLeverage: {
    title: "Catalytic Leverage (other / bank)",
    what: "Crowded-in capital per US$1 provided by Afreximbank (other ÷ bank).",
    why: "Measures catalytic effect—how the Bank’s participation mobilizes additional investors.",
    how: "Inner ring represents the Bank’s baseline ($1). The outer ring fills to the leverage ratio; colour bands mark thresholds (e.g., ≥3× acceptable, ≥4.5× strong).",
  },
  intraAfricanTradeShare: {
    title: "Intra-African Trade Share",
    what: "Share of supported trade flows that occur within Africa (intra ÷ total).",
    why: "Core mandate indicator for regional integration and AfCFTA.",
    how: "100% stacked bar: gold = intra-African; pale segment = extra-African. Badge shows the exact percent; labels show intra and total amounts.",
  },
  governmentRevenueMultiplier: {
    title: "Government‑Revenue Multiplier",
    what: "Estimated government revenue generated per US$1 of Afreximbank financing (gov revenue ÷ bank amount) for the selected scope and period.",
    why: "Shows fiscal contribution—taxes, duties, fees—linked to supported activity, complementing jobs and trade outcomes within TDIA Pillar 2.",
    how: "Each thermometer fills to the multiplier value. Red = below the minimum threshold, gold = meets the acceptable level, green = strong performance. Thresholds are configurable in the chart.",
  },
  smeParticipationFunnel: {
    title: "SME Participation Funnel",
    what: "Shows how SMEs progress through the pipeline — from Eligible to Approved, Disbursed and Active.",
    why: "Highlights pipeline quality and where drop-offs occur. Overlay strips show inclusion — women- and youth-led SMEs.",
    how: "Bar width = SMEs at that stage. Hover a stage to see conversion from the previous one. The header micro-stat ‘SMEs per $1M’ divides SMEs at the selected stage by total USD disbursed.",
  },
  inclusiveJobs: {
    title: "Inclusive Employment (Women, Men, Youth 18–35)",
    what: "Shows who benefits from job creation: the share of jobs held by women and men, with a band indicating the share held by youth (18–35). Youth can be women or men so the band overlays both sides.",
    why: "Gender and youth inclusion are core TDIA indicators and important to funding partners and internal strategy.",
    how: "Each small card is a mirror bar (‘butterfly’): women on the left, men on the right; the translucent band across the centre shows the youth share of all jobs, spanning both sides. Percent labels round to whole numbers; hover any segment to see counts and shares.",
  },
  localContent: {
    title: "Domestic Value Chain Contribution (Local content)",
    what: "Shows the split between inputs sourced domestically vs. imported for supported projects over time.",
    why: "Local sourcing strengthens domestic supply chains and skills, keeps more value in-country, and aligns with the TDIA focus on local content and value addition under Strategic Intent (Pillar 1).",
    how: "Ribbon view: The teal band is Domestic; the gold band is Imported. Each time point totals 100% of inputs (US$). Hover to see the US$ split and the domestic share. On small screens the ribbon becomes stacked bars for clarity. Mini view: The tiny 100%-stacked ribbon shows only the domestic share over time; chips on the right display the latest split. A rising teal area indicates increasing local sourcing.",
  },
  intraInvestmentFlows: {
  title: "Intra-African Investment Flows",
  what: "Directed flows of Afreximbank-enabled investment moving between subregions in the selected period.",
  why: "Reveals regional linkages—who funds whom—helping spot clusters, gaps and corridors that matter for integration.",
  how: "Each curve connects an origin to a destination; thickness shows amount. Use the slider to hide the long tail. Hover or focus a region (arrow keys + Enter) to highlight its in/out flows. Badges next to labels show quick totals in and out.",
},
};

/* --- Unified map for the Help Drawer --- */
export type HelpKey = HeadlineMetricKey | HelpTopicKey;
export const helpContent: Record<HelpKey, Help> = {
  ...metricHelp,
  ...topicHelp,
};
