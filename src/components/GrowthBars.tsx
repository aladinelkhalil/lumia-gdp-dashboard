import { Bar, BarChart, ResponsiveContainer, XAxis, LabelList } from "recharts";

type Datum = { label: string; value: number };

export default function GrowthBars({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="growthBar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#010205" />
            <stop offset="34%" stopColor="#0C1731" />
            <stop offset="100%" stopColor="#0C1731" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: "#ffffff", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="value" fill="url(#growthBar)" radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => `${v}%`}
            fill="#ffffff"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
