"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDeadlines, useSettings } from "@/lib/store";
import { isOverdue, isDueSoon } from "@/lib/deadlines";

export function ReminderBanner() {
  const [deadlines, , hydrated] = useDeadlines();
  const [settings] = useSettings();
  const [notifAsked, setNotifAsked] = useState(false);

  const overdue = deadlines.filter((d) => isOverdue(d));
  const dueSoon = deadlines.filter(
    (d) => !isOverdue(d) && isDueSoon(d, settings.reminderWindowHours),
  );

  useEffect(() => {
    if (!hydrated || notifAsked) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") return; // don't auto-prompt; user opts in via button
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifAsked(true);
    if (Notification.permission === "granted") {
      const seenKey = "portfolio:notified-ids";
      const seen: string[] = JSON.parse(sessionStorage.getItem(seenKey) || "[]");
      const toNotify = [...overdue, ...dueSoon].filter((d) => !seen.includes(d.id));
      toNotify.slice(0, 5).forEach((d) => {
        new Notification(isOverdue(d) ? "Overdue!" : "Deadline coming up", {
          body: `${d.title} (${d.course}) — due ${new Date(d.dueDate).toLocaleString()}`,
        });
      });
      sessionStorage.setItem(
        seenKey,
        JSON.stringify([...seen, ...toNotify.map((d) => d.id)]),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || (!overdue.length && !dueSoon.length)) return null;

  return (
    <div
      className={`border-b px-6 py-2.5 text-sm ${
        overdue.length
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-warning/30 bg-warning/10 text-warning"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <span>
          {overdue.length
            ? `${overdue.length} deadline${overdue.length > 1 ? "s" : ""} overdue.`
            : `${dueSoon.length} deadline${dueSoon.length > 1 ? "s" : ""} due within ${settings.reminderWindowHours}h.`}
        </span>
        <Link href="/dashboard/deadlines" className="underline underline-offset-2">
          Review now →
        </Link>
      </div>
    </div>
  );
}
