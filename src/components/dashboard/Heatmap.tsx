"use client";

import { addDays, format, startOfWeek } from "date-fns";

interface HeatmapProps {
  data: Record<string, number>;
  weeks?: number;
  accent?: string;
}

export function Heatmap({ data, weeks = 20, accent = "var(--accent)" }: HeatmapProps) {
  const today = new Date();
  const start = startOfWeek(addDays(today, -weeks * 7 + 7), { weekStartsOn: 0 });

  const max = Math.max(1, ...Object.values(data));

  const days: { date: string; value: number }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    const iso = format(d, "yyyy-MM-dd");
    days.push({ date: iso, value: data[iso] ?? 0 });
  }

  const columns: { date: string; value: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  function opacity(value: number) {
    if (value <= 0) return 0.06;
    return Math.min(1, 0.25 + (value / max) * 0.75);
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.value}`}
              className="h-3 w-3 rounded-[3px]"
              style={{
                backgroundColor: accent,
                opacity: opacity(day.value),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
