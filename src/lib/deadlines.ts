import type { Deadline, Priority } from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 1.6,
  medium: 1.15,
  low: 0.85,
};

export function hoursUntil(dueDate: string, from = new Date()): number {
  const diffMs = new Date(dueDate).getTime() - from.getTime();
  return diffMs / (1000 * 60 * 60);
}

export function daysUntil(dueDate: string, from = new Date()): number {
  return hoursUntil(dueDate, from) / 24;
}

export function isOverdue(d: Deadline, from = new Date()): boolean {
  return d.status !== "done" && hoursUntil(d.dueDate, from) < 0;
}

export function isDueSoon(
  d: Deadline,
  windowHours: number,
  from = new Date(),
): boolean {
  const h = hoursUntil(d.dueDate, from);
  return d.status !== "done" && h >= 0 && h <= windowHours;
}

/** Urgency score: higher = more pressing. Combines remaining effort, time left, and priority. */
export function urgencyScore(d: Deadline, from = new Date()): number {
  if (d.status === "done") return -Infinity;
  const daysLeft = Math.max(daysUntil(d.dueDate, from), 0.08); // floor ~2h
  const effortRemaining = Math.max(d.estimatedHours, 0.5);
  const base = effortRemaining / daysLeft;
  return base * PRIORITY_WEIGHT[d.priority];
}

export function sortByUrgency(deadlines: Deadline[], from = new Date()) {
  return [...deadlines].sort((a, b) => {
    if (isOverdue(a, from) !== isOverdue(b, from)) {
      return isOverdue(a, from) ? -1 : 1;
    }
    return urgencyScore(b, from) - urgencyScore(a, from);
  });
}

export function upcoming(deadlines: Deadline[]) {
  return deadlines
    .filter((d) => d.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
