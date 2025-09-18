import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

type Datum = { date: string; value: number };

export default function GdpLine({ data }: { data: Datum[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gdp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            minTickGap={48}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            tickFormatter={(v) => formatTrillions(v)}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1629",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            labelStyle={{ color: "white" }}
            formatter={(v) => formatTrillions(Number(v))}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#60a5fa"
            fill="url(#gdp)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTrillions(value: number) {
  if (value >= 1_000_000_000_000)
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${value}`;
}
