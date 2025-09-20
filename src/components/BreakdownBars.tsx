import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

type Datum = { label: string; value: number };

export default function BreakdownBars({ data }: { data: Datum[] }) {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="breakdownBg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#010205" />
              <stop offset="100%" stopColor="#0C1731" />
            </linearGradient>
          </defs>
          <XAxis type="number" hide domain={[0, 100]} reversed />
          <YAxis
            type="category"
            dataKey="label"
            width={80}
            tick={{ fill: "#ffffff", fontSize: 12, textAnchor: "start" }}
            axisLine={false}
            tickLine={false}
            tickMargin={72}
          />
          <Bar
            dataKey="value"
            fill="#2F3856"
            radius={[6, 6, 6, 6]}
            background={{ fill: "url(#breakdownBg)" }}
          >
            <LabelList dataKey="value" content={renderRightAlignedLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function renderRightAlignedLabel({ x, y, value }: any) {
  const display = `${Number(value).toFixed(2)}%`;
  const paddingX = 8;
  const textWidth = (display.length + 1) * 6.5;
  const pillWidth = textWidth + paddingX * 2;
  const pillHeight = 39;

  const rectX = x - pillWidth; // nudge left from the far-right edge
  const rectY = pillHeight / 2;

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        rx={8}
        ry={8}
        width={pillWidth}
        height={pillHeight}
        opacity={0}
      />
      <text
        x={rectX + pillWidth - paddingX}
        y={y + rectY + 4}
        textAnchor="end"
        fill="#e5e7ff"
        fontSize={12}
      >
        {display}
      </text>
    </g>
  );
}
