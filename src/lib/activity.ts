import { format, subDays } from "date-fns";
import type { WorkSession } from "./types";

export function sessionsByDateHours(sessions: WorkSession[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of sessions) {
    map[s.date] = (map[s.date] ?? 0) + s.durationMinutes / 60;
  }
  for (const key of Object.keys(map)) {
    map[key] = Math.round(map[key] * 10) / 10;
  }
  return map;
}

export function computeStreak(datesWithActivity: Set<string>, from = new Date()): number {
  let streak = 0;
  let cursor = from;
  // allow "today" to be empty without breaking a streak that ended yesterday
  if (!datesWithActivity.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }
  while (datesWithActivity.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function lastNDaysHours(sessions: WorkSession[], n: number, from = new Date()): number {
  const cutoff = subDays(from, n).getTime();
  return (
    sessions.filter((s) => new Date(s.date).getTime() >= cutoff).reduce((sum, s) => sum + s.durationMinutes, 0) / 60
  );
}
