import axios from "axios";

export type PythPricePoint = {
  publish_time: number;
  price: string;
  conf?: string;
};

export type PythTimeseriesResponse = {
  id: string;
  type: string;
  points: PythPricePoint[];
};

const DEFAULT_HERMES = "https://hermes.pyth.network";

const hermes = axios.create({
  baseURL: import.meta.env.VITE_HERMES_BASE_URL || DEFAULT_HERMES,
  timeout: 10_000,
});

export async function fetchLatestPrice(feedId: string) {
  const { data } = await hermes.get("/v2/price/latest", {
    params: { ids: feedId },
  });
  return data;
}

export async function fetchTimeseries(
  feedId: string,
  params?: { start_time?: number; end_time?: number; interval?: string }
) {
  // Hermes v2 timeseries path; interval examples: '1d', '1w', '1mo'
  const { data } = await hermes.get(`/v2/price/timeseries/${feedId}`, {
    params,
  });
  return data as PythTimeseriesResponse;
}

export function mapTimeseriesToChart(ts: PythTimeseriesResponse) {
  return ts.points.map((p) => ({
    date: new Date(p.publish_time * 1000).toISOString(),
    value: Number(p.price),
  }));
}
