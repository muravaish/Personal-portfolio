"use client";

import { useMemo, useState } from "react";
import { useDeadlines, useSettings, useSkillGoals, uid } from "@/lib/store";
import type { Priority, SkillGoal } from "@/lib/types";
import { generatePlan, todayIso } from "@/lib/scheduler";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

const TYPE_STYLE: Record<string, string> = {
  coursework: "border-l-danger",
  "skill-building": "border-l-accent",
  "job-search": "border-l-accent-2",
};

function emptyGoal() {
  return { title: "", estimatedHours: 6, priority: "medium" as Priority };
}

export function ScheduleView() {
  const [deadlines] = useDeadlines();
  const [skillGoals, setSkillGoals, hydrated] = useSkillGoals();
  const [settings] = useSettings();
  const [form, setForm] = useState(emptyGoal());
  const [showForm, setShowForm] = useState(false);
  const [horizon, setHorizon] = useState(10);

  const plan = useMemo(
    () => generatePlan(deadlines, skillGoals, settings, { horizonDays: horizon }),
    [deadlines, skillGoals, settings, horizon],
  );

  function addGoal() {
    if (!form.title.trim()) return;
    const g: SkillGoal = {
      id: uid(),
      title: form.title.trim(),
      estimatedHours: Number(form.estimatedHours) || 1,
      hoursLogged: 0,
      priority: form.priority,
      createdAt: new Date().toISOString(),
    };
    setSkillGoals((prev) => [...prev, g]);
    setForm(emptyGoal());
    setShowForm(false);
  }

  function bump(id: string, delta: number) {
    setSkillGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, hoursLogged: Math.max(0, Math.min(g.estimatedHours, g.hoursLogged + delta)) }
          : g,
      ),
    );
  }

  function removeGoal(id: string) {
    setSkillGoals((prev) => prev.filter((g) => g.id !== id));
  }

  if (!hydrated) return null;

  const today = plan.find((d) => d.date === todayIso());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-sm text-muted">
          A rule-based planner that protects near-term coursework deadlines while always reserving time for the
          skill-building work you need for job-readiness.
        </p>
      </div>

      <section className="card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Skill / job-prep goals</h2>
          <button className="btn-ghost text-xs" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add goal"}
          </button>
        </div>
        {showForm && (
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className="input sm:col-span-2"
              placeholder="e.g. Build a REST API with auth"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} priority
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="input"
              value={form.estimatedHours}
              onChange={(e) => setForm((f) => ({ ...f, estimatedHours: Number(e.target.value) }))}
              placeholder="Estimated hours"
            />
            <button className="btn-primary sm:col-span-2" onClick={addGoal}>
              Add goal
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {skillGoals.length === 0 && (
            <p className="text-xs text-muted">No goals yet — add what you&apos;re building toward for your target job.</p>
          )}
          {skillGoals.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--overlay-soft)] p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <span className="badge text-muted">{g.priority}</span>
                </div>
                <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--overlay-soft-hover)]">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.min(100, (g.hoursLogged / g.estimatedHours) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {g.hoursLogged}h / {g.estimatedHours}h
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn-ghost text-xs" onClick={() => bump(g.id, 0.5)}>
                  +0.5h
                </button>
                <button className="btn-ghost text-xs" onClick={() => bump(g.id, -0.5)}>
                  -0.5h
                </button>
                <button className="text-xs text-danger hover:underline" onClick={() => removeGoal(g.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {today && (
        <section className="card border-accent/30 p-5">
          <h2 className="mb-3 text-sm font-semibold">Today</h2>
          <div className="flex flex-col gap-2">
            {today.blocks.map((b) => (
              <div key={b.id} className={`border-l-2 pl-3 ${TYPE_STYLE[b.type]}`}>
                <p className="text-sm font-medium">
                  {b.title} <span className="text-muted">— {b.hours}h</span>
                </p>
                <p className="text-xs text-muted">{b.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Plan ahead</h2>
          <select className="input w-auto" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={10}>10 days</option>
            <option value={14}>14 days</option>
          </select>
        </div>
        <div className="flex flex-col gap-3">
          {plan.length === 0 && (
            <p className="text-sm text-muted">
              Nothing to plan yet — add deadlines and/or skill goals above to generate a schedule.
            </p>
          )}
          {plan.map((day) => (
            <div key={day.date} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {new Date(day.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs text-muted">{day.totalHours}h planned</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {day.blocks.map((b) => (
                  <div key={b.id} className={`border-l-2 pl-3 text-sm ${TYPE_STYLE[b.type]}`}>
                    {b.title} <span className="text-muted">— {b.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
