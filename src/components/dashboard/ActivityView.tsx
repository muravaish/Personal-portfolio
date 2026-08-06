"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useDeadlines, useSessions, useSettings, useSkillGoals, uid } from "@/lib/store";
import type { SessionCategory, WorkSession } from "@/lib/types";
import { computeStreak, lastNDaysHours, sessionsByDateHours } from "@/lib/activity";
import { generatePlan, todayIso } from "@/lib/scheduler";
import { Heatmap } from "./Heatmap";

const CATEGORIES: SessionCategory[] = ["coursework", "skill-building", "job-search", "project"];

interface GithubContribution {
  date: string;
  count: number;
}
interface GithubResponse {
  total?: Record<string, number>;
  contributions?: GithubContribution[];
  error?: string;
}

function emptyForm() {
  return {
    date: format(new Date(), "yyyy-MM-dd"),
    durationMinutes: 60,
    category: "coursework" as SessionCategory,
    label: "",
  };
}

export function ActivityView() {
  const [sessions, setSessions, hydrated] = useSessions();
  const [settings] = useSettings();
  const [deadlines] = useDeadlines();
  const [skillGoals] = useSkillGoals();
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [gh, setGh] = useState<GithubResponse | null>(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.githubUsername) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGhLoading(true);
    setGhError(null);
    fetch(`/api/github/${encodeURIComponent(settings.githubUsername)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load GitHub activity.");
        setGh(data);
      })
      .catch((e) => setGhError(e.message))
      .finally(() => setGhLoading(false));
  }, [settings.githubUsername]);

  const selfHeatmapData = useMemo(() => sessionsByDateHours(sessions), [sessions]);
  const activeDates = useMemo(() => new Set(Object.keys(selfHeatmapData)), [selfHeatmapData]);
  const streak = useMemo(() => computeStreak(activeDates), [activeDates]);
  const week = useMemo(() => lastNDaysHours(sessions, 7), [sessions]);

  const ghHeatmapData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of gh?.contributions ?? []) map[c.date] = c.count;
    return map;
  }, [gh]);

  const plan = useMemo(
    () => generatePlan(deadlines, skillGoals, settings, { horizonDays: 14 }),
    [deadlines, skillGoals, settings],
  );

  const plannedVsActual = useMemo(() => {
    return plan
      .filter((d) => d.date <= todayIso())
      .slice(-7)
      .map((d) => ({
        date: d.date,
        planned: d.totalHours,
        actual: selfHeatmapData[d.date] ?? 0,
      }));
  }, [plan, selfHeatmapData]);

  function addSession() {
    if (!form.label.trim()) return;
    const s: WorkSession = {
      id: uid(),
      date: form.date,
      durationMinutes: Number(form.durationMinutes) || 0,
      category: form.category,
      label: form.label.trim(),
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [s, ...prev]);
    setForm(emptyForm());
    setShowForm(false);
  }

  function removeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted">Real GitHub contributions plus your own logged study/build sessions.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Log session"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <StatCard label="Logged this week" value={`${week.toFixed(1)}h`} />
        <StatCard label="Sessions logged" value={`${sessions.length}`} />
      </div>

      {showForm && (
        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">What did you work on?</label>
            <input
              className="input mt-1"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. ML assignment, LeetCode practice, portfolio project"
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input mt-1"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              min={5}
              step={5}
              className="input mt-1"
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Category</label>
            <select
              className="input mt-1"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SessionCategory }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={addSession}>
              Log session
            </button>
          </div>
        </div>
      )}

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Self-logged activity</h2>
        <Heatmap data={selfHeatmapData} accent="var(--accent)" />
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">GitHub activity</h2>
          {!settings.githubUsername && (
            <Link href="/dashboard/settings" className="text-xs text-accent-2 hover:underline">
              Add your GitHub username →
            </Link>
          )}
        </div>
        {settings.githubUsername && ghLoading && <p className="text-xs text-muted">Loading…</p>}
        {settings.githubUsername && ghError && <p className="text-xs text-danger">{ghError}</p>}
        {settings.githubUsername && gh && !ghError && (
          <>
            <p className="mb-2 text-xs text-muted">
              {Object.values(gh.total ?? {})[0] ?? "—"} contributions in the last year for{" "}
              <span className="text-foreground">{settings.githubUsername}</span>
            </p>
            <Heatmap data={ghHeatmapData} accent="var(--accent-2)" />
          </>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Planned vs. actual (last 7 tracked days)</h2>
        <div className="flex flex-col gap-2">
          {plannedVsActual.length === 0 && (
            <p className="text-xs text-muted">Generate a schedule first to compare against your actual logged hours.</p>
          )}
          {plannedVsActual.map((row) => {
            const pct = row.planned > 0 ? Math.min(100, (row.actual / row.planned) * 100) : row.actual > 0 ? 100 : 0;
            return (
              <div key={row.date} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-muted">{format(new Date(row.date), "EEE MMM d")}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--overlay-soft-hover)]">
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-24 shrink-0 text-right text-muted">
                  {row.actual.toFixed(1)}h / {row.planned.toFixed(1)}h
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Recent sessions</h2>
        {sessions.slice(0, 10).map((s) => (
          <div key={s.id} className="card flex items-center justify-between p-3 text-sm">
            <div>
              <span className="font-medium">{s.label}</span>{" "}
              <span className="badge ml-1 text-muted">{s.category}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>
                {s.date} · {(s.durationMinutes / 60).toFixed(1)}h
              </span>
              <button className="text-danger hover:underline" onClick={() => removeSession(s.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-xs text-muted">No sessions logged yet.</p>}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="label">{label}</p>
      <p className="mt-1 text-2xl font-semibold gradient-text">{value}</p>
    </div>
  );
}
