export const formatCurrencyCompact = (v: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1, style: "currency", currency: "USD" }).format(v);

export const formatNumberCompact = (v: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);

export const familyAccent = (family: "money" | "projects" | "trade" | "jobs") =>
  ({ money: "var(--accent)", projects: "var(--accent-2)", trade: "var(--accent-3)", jobs: "var(--accent-4)" }[family]);
