"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDeadlines, useSessions, useSettings, useSkillGoals } from "@/lib/store";
import { isOverdue, isDueSoon, upcoming } from "@/lib/deadlines";
import { generatePlan, planForDate, todayIso } from "@/lib/scheduler";
import { computeStreak, sessionsByDateHours } from "@/lib/activity";

export function OverviewView() {
  const [deadlines, , hydrated] = useDeadlines();
  const [sessions] = useSessions();
  const [skillGoals] = useSkillGoals();
  const [settings] = useSettings();

  const overdue = deadlines.filter((d) => isOverdue(d));
  const dueSoon = deadlines.filter((d) => !isOverdue(d) && isDueSoon(d, settings.reminderWindowHours));
  const next3 = upcoming(deadlines).slice(0, 3);

  const plan = useMemo(
    () => generatePlan(deadlines, skillGoals, settings, { horizonDays: 3 }),
    [deadlines, skillGoals, settings],
  );
  const today = planForDate(plan, todayIso());

  const streak = useMemo(() => computeStreak(new Set(Object.keys(sessionsByDateHours(sessions)))), [sessions]);

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted">Your command center, at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? "danger" : "default"} href="/dashboard/deadlines" />
        <Stat label="Due soon" value={dueSoon.length} tone={dueSoon.length ? "warning" : "default"} href="/dashboard/deadlines" />
        <Stat label="Activity streak" value={`${streak}d`} href="/dashboard/activity" />
        <Stat label="Skill goals active" value={skillGoals.length} href="/dashboard/schedule" />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Today&apos;s plan</h2>
          <Link href="/dashboard/schedule" className="text-xs text-accent-2 hover:underline">
            Full schedule →
          </Link>
        </div>
        {today && today.blocks.length ? (
          <div className="flex flex-col gap-2">
            {today.blocks.map((b) => (
              <p key={b.id} className="text-sm">
                {b.title} <span className="text-muted">— {b.hours}h</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Nothing planned yet — add deadlines or skill goals to generate a plan.</p>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Next up</h2>
          <Link href="/dashboard/deadlines" className="text-xs text-accent-2 hover:underline">
            All deadlines →
          </Link>
        </div>
        {next3.length ? (
          <div className="flex flex-col gap-2">
            {next3.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span>
                  {d.title} <span className="text-muted">({d.course})</span>
                </span>
                <span className="text-muted">{new Date(d.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No deadlines tracked yet.</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/dashboard/jobs" title="Job Matcher" desc="See jobs ranked against your skills" />
        <QuickLink href="/dashboard/assistant" title="AI Assistant" desc="Ask what to prioritize" />
        <QuickLink href="/dashboard/settings" title="Settings" desc="Connect CourseWeb, GitHub, AI key" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  tone?: "danger" | "warning" | "default";
  href: string;
}) {
  const toneClass = { danger: "text-danger", warning: "text-warning", default: "gradient-text" }[tone];
  return (
    <Link href={href} className="card block p-5 transition-transform hover:-translate-y-0.5">
      <p className="label">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card block p-5 transition-transform hover:-translate-y-0.5">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </Link>
  );
}
