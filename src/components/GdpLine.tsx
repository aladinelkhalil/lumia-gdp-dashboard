import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ReferenceDot,
} from "recharts";

type Datum = { date: string; value: number };

export default function GdpLine({ data }: { data: Datum[] }) {
  const series = data.map((d) => ({
    ...d,
    dateMs: new Date(d.date).getTime(),
  }));
  const values = series.map((d) => d.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  const xTickMs = [2020, 2021, 2022, 2023, 2024, 2025].map((y) =>
    new Date(`${y}`).getTime()
  );

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="110%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 8, right: 0, left: 16, bottom: 40 }}
        >
          <defs>
            <linearGradient id="gdp" x1="0" y1="1" x2="0" y2="0">
              <stop offset="11.82%" stopColor="#010205" />
              <stop offset="61.61%" stopColor="#0C1731" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0C1731" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dateMs"
            type="number"
            scale="time"
            domain={[
              new Date("2020-01-01T00:00:00.000Z").getTime(),
              new Date("2025-12-31T23:59:59.999Z").getTime(),
            ]}
            ticks={xTickMs}
            tickFormatter={(ms: number) =>
              new Date(ms).getFullYear().toString()
            }
            tick={{ fill: "#ffffff", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickMargin={24}
          />
          <YAxis
            tick={{ fill: "#ffffff", fontSize: 12 }}
            tickFormatter={(v) => formatTrillions(v)}
            ticks={[minValue, maxValue]}
            axisLine={false}
            tickLine={false}
            tickMargin={4}
            width={64}
          />
          <Tooltip content={<PillTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ffffff"
            fill="url(#gdp)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#ffffff", stroke: "#ffffff" }}
          />
          <ReferenceDot
            x={series[series.length - 1]?.dateMs}
            y={series[series.length - 1]?.value}
            r={4}
            fill="#ffffff"
            stroke="#ffffff"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTrillions(value: number) {
  if (value >= 1_000_000_000_000)
    return `$${(value / 1_000_000_000_000).toFixed(0)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value}`;
}

function PillTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const val = Number(payload[0].value);
  const text = formatTrillions(val);

  return (
    <div
      style={{
        background: "#4B75F6",
        color: "#ffffff",
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset",
      }}
    >
      {text}
    </div>
  );
}
