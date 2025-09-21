import axios from "axios";
import { gdpFeeds, allFeedIds, extraFeedIds } from "./gdpIds";

const DEFAULT_HERMES = "https://hermes.pyth.network";

const hermes = axios.create({
  baseURL: DEFAULT_HERMES,
  timeout: 10_000,
});

type HermesLatestPrice = {
  id: string;
  price: { price: string; expo: number };
};

type HermesLatestResponse = {
  parsed: HermesLatestPrice[];
};

export async function fetchLatestForIds(ids: string[]) {
  const { data } = await hermes.get("/v2/updates/price/latest", {
    params: { ids },
  });
  return data as HermesLatestResponse;
}

export type PpiBreakdown = { label: string; value: number }[];

function normalizeId(id: string) {
  const lower = id.toLowerCase();
  return lower.startsWith("0x") ? lower.slice(2) : lower;
}

export function computeGdpLevelsFromRates(
  yearlyRates: { label: string; value: number }[],
  baselineTrillions = 21.54,
  baselineYear = 2020
) {
  const map = new Map<number, number>();
  for (const r of yearlyRates) {
    const y = Number(r.label);
    if (!Number.isFinite(y)) continue;
    map.set(y, r.value);
  }

  const years = Array.from(map.keys())
    .concat([baselineYear])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);

  let levelTrillions = baselineTrillions;
  const series: { date: string; value: number }[] = [];

  for (const year of years) {
    if (year === baselineYear) {
      series.push({
        date: new Date(`${year}`).toISOString(),
        value: levelTrillions * 1_000_000_000_000,
      });
      continue;
    }
    const growthPercent = map.get(year) || 0; // apply the rate for this year
    levelTrillions = levelTrillions * (1 + growthPercent / 100);
    series.push({
      date: new Date(`${year}`).toISOString(),
      value: levelTrillions * 1_000_000_000_000,
    });
  }

  return series;
}

export async function fetchAllLatest() {
  const { parsed } = await fetchLatestForIds(allFeedIds);

  // GDP yearly rates
  const idToYear = new Map(gdpFeeds.map((f) => [f.id, f.year] as const));
  const yearToSum = new Map<number, number>();
  for (const p of parsed) {
    const year = idToYear.get(p.id);
    if (!year) continue;
    const val = Number(p.price.price) * Math.pow(10, Number(p.price.expo));
    yearToSum.set(year, (yearToSum.get(year) || 0) + val);
  }
  const rates = Array.from(yearToSum.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, value]) => ({
      label: String(year),
      value: Number(value.toFixed(2)),
    }));

  // PPI + YoY
  const idToLabel: Record<string, string> = {
    [normalizeId(extraFeedIds[0])]: "PPI INDEX",
    [normalizeId(extraFeedIds[1])]: "CORE PPI",
    [normalizeId(extraFeedIds[2])]: "PPI",
  };
  const yoyId = normalizeId(extraFeedIds[3]);
  const breakdown: { label: string; value: number }[] = [];
  let yoy = 0;
  for (const p of parsed) {
    const id = p.id;
    const val = Number(p.price.price) * Math.pow(10, Number(p.price.expo));
    if (id === yoyId) {
      yoy = Number(val.toFixed(2));
    } else if (idToLabel[id]) {
      breakdown.push({ label: idToLabel[id], value: Number(val.toFixed(2)) });
    }
  }
  breakdown.sort((a, b) => a.label.localeCompare(b.label));

  return { rates, breakdown, yoy };
}
