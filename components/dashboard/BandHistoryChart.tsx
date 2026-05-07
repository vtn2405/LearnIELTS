"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  bandEstimate: number | null;
  createdAt: Date | string;
  skill: string;
}

interface Props {
  data: DataPoint[];
  targetBand: number;
}

function groupByDay(data: DataPoint[]) {
  const map = new Map<string, number[]>();
  for (const d of data) {
    const day = new Date(d.createdAt).toLocaleDateString("vi-VN", {
      weekday: "short",
    });
    if (!map.has(day)) map.set(day, []);
    if (d.bandEstimate !== null) map.get(day)!.push(d.bandEstimate);
  }
  return Array.from(map.entries()).map(([day, bands]) => ({
    day,
    band: parseFloat(
      (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1),
    ),
  }));
}

export function BandHistoryChart({ data, targetBand }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-lowest p-8">
        <h3 className="font-semibold text-slate-800 mb-1">
          Band Score History
        </h3>
        <p className="text-[13px] text-slate-400">
          Biểu đồ đánh giá năng lực trong 7 ngày qua
        </p>
        <div className="mt-6 h-48 flex items-center justify-center rounded-xl ring-1 ring-outline-variant/15 border border-dashed border-outline-variant/20">
          <p className="text-slate-400 text-[13px]">
            Chưa có dữ liệu — làm bài để xem tiến độ
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupByDay(data);

  return (
    <div className="rounded-xl ring-1 ring-outline-variant/15 bg-surface-container-lowest p-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Band Score History</h3>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Biểu đồ đánh giá năng lực trong 7 ngày qua
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1a3a5c] inline-block rounded" />
            Score
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-500 inline-block rounded" />
            Target ({targetBand.toFixed(1)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-300 inline-block rounded" />
            Baseline (6.5)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={grouped}
          margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis
            domain={[4, 9]}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />
          <ReferenceLine
            y={targetBand}
            stroke="#0d9488"
            strokeDasharray="4 4"
            label={{
              value: targetBand.toFixed(1),
              position: "right",
              fontSize: 11,
              fill: "#0d9488",
            }}
          />
          <ReferenceLine
            y={6.5}
            stroke="#fca5a5"
            strokeDasharray="4 4"
            label={{
              value: "6.5",
              position: "right",
              fontSize: 11,
              fill: "#fca5a5",
            }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="#1a3a5c"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#1a3a5c" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
