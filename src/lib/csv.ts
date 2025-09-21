export type GrowthDatum = { label: string; value: number };
export type LineDatum = { date: string; value: number };

export function toCsv(rows: string[][]) {
  const esc = (v: string) => {
    if (v == null) return "";
    const needsQuote = /[",\n]/.test(v);
    const safe = String(v).replace(/"/g, '""');
    return needsQuote ? `"${safe}"` : safe;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function buildDashboardCsv(params: {
  latestTrillions: number;
  peakTrillions: number;
  yoyPercent: number;
  levels: LineDatum[];
  yearlyRates: GrowthDatum[];
  breakdown: GrowthDatum[];
}) {
  const {
    latestTrillions,
    peakTrillions,
    yoyPercent,
    levels,
    yearlyRates,
    breakdown,
  } = params;

  const sections: string[][] = [];

  sections.push(["Dashboard KPIs"]);
  sections.push(["Latest (T)", latestTrillions.toFixed(2)]);
  sections.push(["All-time Peak (T)", peakTrillions.toFixed(2)]);
  sections.push(["YoY Growth (%)", yoyPercent.toFixed(2)]);
  sections.push([""]);

  sections.push(["GDP Levels (USD)"]);
  sections.push(["year", "value_usd"]);
  for (const d of levels)
    sections.push([
      new Date(d.date).getFullYear().toString(),
      String(Math.round(d.value)),
    ]);
  sections.push([""]);

  sections.push(["GDP Yearly Rates (%)"]);
  sections.push(["year", "rate_percent"]);
  for (const r of yearlyRates) sections.push([r.label, r.value.toFixed(2)]);
  sections.push([""]);

  sections.push(["GDP Breakdown (%)"]);
  sections.push(["label", "value_percent"]);
  for (const b of breakdown) sections.push([b.label, b.value.toFixed(2)]);

  return toCsv(sections);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
