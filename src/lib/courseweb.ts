import type { Deadline } from "./types";
import type { CoursewebEvent } from "@/app/api/courseweb/route";
import { uid } from "./store";

export interface SyncResult {
  imported: number;
  updated: number;
  unchanged: number;
  deadlines: Deadline[];
}

export async function fetchCoursewebEvents(icsUrl: string): Promise<CoursewebEvent[]> {
  const res = await fetch(`/api/courseweb?url=${encodeURIComponent(icsUrl)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to sync CourseWeb calendar.");
  }
  return data.events as CoursewebEvent[];
}

/** Merges freshly-fetched CourseWeb events into the existing deadline list, deduping by externalId. */
export function mergeCoursewebEvents(
  existing: Deadline[],
  events: CoursewebEvent[],
): SyncResult {
  const byExternalId = new Map(
    existing.filter((d) => d.externalId).map((d) => [d.externalId as string, d]),
  );

  let imported = 0;
  let updated = 0;
  let unchanged = 0;

  const next = [...existing];

  for (const ev of events) {
    const current = byExternalId.get(ev.externalId);
    if (!current) {
      next.push({
        id: uid(),
        title: ev.title,
        course: ev.course,
        type: "assignment",
        dueDate: ev.dueDate,
        estimatedHours: 2,
        priority: "medium",
        status: "pending",
        notes: ev.description,
        createdAt: new Date().toISOString(),
        externalId: ev.externalId,
        sourceUrl: ev.sourceUrl,
      });
      imported += 1;
    } else if (current.dueDate !== ev.dueDate || current.title !== ev.title) {
      const idx = next.findIndex((d) => d.id === current.id);
      if (idx !== -1) {
        next[idx] = { ...next[idx], dueDate: ev.dueDate, title: ev.title, course: ev.course };
      }
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  return { imported, updated, unchanged, deadlines: next };
}
