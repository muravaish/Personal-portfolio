"use client";

import { useEffect, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";

interface GithubContribution {
  date: string;
  count: number;
}
interface GithubResponse {
  contributions?: GithubContribution[];
}

function extractGithubUsername(githubUrl: string): string {
  const match = githubUrl.match(/github\.com\/([^/?#]+)/i);
  return match ? match[1] : "";
}

/** Renders the real GitHub contribution graph as hero art — live data instead of decorative shapes. */
export function LiveActivityBackdrop({ githubUrl }: { githubUrl: string }) {
  const username = extractGithubUsername(githubUrl);
  const [data, setData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    fetch(`/api/github/${encodeURIComponent(username)}`)
      .then(async (r) => {
        if (!r.ok) return;
        const json = (await r.json()) as GithubResponse;
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const c of json.contributions ?? []) map[c.date] = c.count;
        setData(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!data) return null;

  const weeks = 53;
  const today = new Date();
  const start = startOfWeek(addDays(today, -weeks * 7 + 7), { weekStartsOn: 0 });
  const max = Math.max(1, ...Object.values(data));

  const columns: { date: string; value: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; value: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      const iso = format(day, "yyyy-MM-dd");
      col.push({ date: iso, value: data[iso] ?? 0 });
    }
    columns.push(col);
  }

  function opacity(value: number) {
    if (value <= 0) return 0.05;
    return Math.min(1, 0.2 + (value / max) * 0.8);
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden opacity-80 [mask-image:linear-gradient(to_left,black,transparent_75%)]"
    >
      <div className="mr-[-2rem] flex gap-[3px] sm:mr-[2vw]">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((day) => (
              <div
                key={day.date}
                className="h-[9px] w-[9px] rounded-[2px]"
                style={{ backgroundColor: "var(--accent-strong)", opacity: opacity(day.value) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
