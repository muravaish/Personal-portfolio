"use client";

import { useMemo, useState } from "react";
import { useDeadlines, useSettings, uid } from "@/lib/store";
import type { Deadline, DeadlineType, Priority } from "@/lib/types";
import { isOverdue, isDueSoon, sortByUrgency } from "@/lib/deadlines";
import { fetchCoursewebEvents, mergeCoursewebEvents } from "@/lib/courseweb";
import { parsePastedDeadline } from "@/lib/parseCourseweb";
import Link from "next/link";

const TYPES: DeadlineType[] = ["assignment", "project", "exam", "other"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

function emptyForm() {
  const due = new Date();
  due.setDate(due.getDate() + 3);
  return {
    title: "",
    course: "",
    type: "assignment" as DeadlineType,
    dueDate: due.toISOString().slice(0, 16),
    estimatedHours: 2,
    priority: "medium" as Priority,
    notes: "",
  };
}

export function DeadlinesView() {
  const [deadlines, setDeadlines, hydrated] = useDeadlines();
  const [settings, setSettings] = useSettings();
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncErr, setSyncErr] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const sorted = sortByUrgency(deadlines);
    return {
      overdue: sorted.filter((d) => isOverdue(d)),
      dueSoon: sorted.filter((d) => !isOverdue(d) && isDueSoon(d, settings.reminderWindowHours) && d.status !== "done"),
      upcoming: sorted.filter(
        (d) => !isOverdue(d) && !isDueSoon(d, settings.reminderWindowHours) && d.status !== "done",
      ),
      done: sorted.filter((d) => d.status === "done"),
    };
  }, [deadlines, settings.reminderWindowHours]);

  function addDeadline() {
    if (!form.title.trim()) return;
    const d: Deadline = {
      id: uid(),
      title: form.title.trim(),
      course: form.course.trim() || "General",
      type: form.type,
      dueDate: new Date(form.dueDate).toISOString(),
      estimatedHours: Number(form.estimatedHours) || 1,
      priority: form.priority,
      status: "pending",
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setDeadlines((prev) => [...prev, d]);
    setForm(emptyForm());
    setShowForm(false);
  }

  function parsePaste() {
    setPasteErr(null);
    const parsed = parsePastedDeadline(pasteText);
    if (!parsed.dueDate) {
      setPasteErr(
        "Couldn't find a \"Due: ...\" line with a recognizable date. Paste the block exactly as shown on the CourseWeb page.",
      );
      return;
    }
    setForm((f) => ({
      ...f,
      title: parsed.title || f.title,
      dueDate: new Date(parsed.dueDate!).toISOString().slice(0, 16),
    }));
    setShowPaste(false);
    setShowForm(true);
    setPasteText("");
  }

  function setStatus(id: string, status: Deadline["status"]) {
    setDeadlines((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  function remove(id: string) {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  }

  async function syncCourseweb() {
    if (!settings.coursewebIcsUrl) return;
    setSyncing(true);
    setSyncErr(null);
    setSyncMsg(null);
    try {
      const events = await fetchCoursewebEvents(settings.coursewebIcsUrl);
      const result = mergeCoursewebEvents(deadlines, events);
      setDeadlines(result.deadlines);
      setSettings((s) => ({ ...s, coursewebLastSynced: new Date().toISOString() }));
      setSyncMsg(
        `Synced: ${result.imported} new, ${result.updated} updated, ${result.unchanged} unchanged.`,
      );
    } catch (e) {
      setSyncErr(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deadlines</h1>
          <p className="text-sm text-muted">
            Assignments, projects, and exams — real CourseWeb items sync in alongside anything you add manually.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setShowPaste((s) => !s)}>
            {showPaste ? "Cancel" : "Paste from CourseWeb"}
          </button>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add deadline"}
          </button>
        </div>
      </div>

      {showPaste && (
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold">Paste from CourseWeb</h2>
          <p className="text-xs text-muted">
            Copy the activity title and the &quot;Opens / Due&quot; lines straight off the module page and paste
            them below — e.g.:
          </p>
          <pre className="rounded-lg bg-white/5 p-3 text-xs text-muted">
{`Kandy Uni - Lab 2 Submission
Opens: Sunday, 9 August 2026, 8:00 AM
Due: Tuesday, 11 August 2026, 12:00 PM`}
          </pre>
          <textarea
            className="input"
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the block here…"
          />
          {pasteErr && <p className="text-xs text-danger">{pasteErr}</p>}
          <button className="btn-primary w-fit" onClick={parsePaste}>
            Parse & continue
          </button>
        </div>
      )}

      <div className="card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">CourseWeb sync</h2>
            <p className="text-xs text-muted">
              {settings.coursewebIcsUrl
                ? `Last synced: ${settings.coursewebLastSynced ? new Date(settings.coursewebLastSynced).toLocaleString() : "never"}`
                : "No calendar URL set yet."}
            </p>
          </div>
          {settings.coursewebIcsUrl ? (
            <button className="btn-ghost text-xs" onClick={syncCourseweb} disabled={syncing}>
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          ) : (
            <Link href="/dashboard/settings" className="btn-ghost text-xs">
              Set up in Settings →
            </Link>
          )}
        </div>
        {syncMsg && <p className="text-xs text-success">{syncMsg}</p>}
        {syncErr && <p className="text-xs text-danger">{syncErr}</p>}
      </div>

      {showForm && (
        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input
              className="input mt-1"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Lab 2 Submission"
            />
          </div>
          <div>
            <label className="label">Course / Module</label>
            <input
              className="input mt-1"
              value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              placeholder="e.g. IT3091 Machine Learning"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input mt-1"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DeadlineType }))}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due date &amp; time</label>
            <input
              type="datetime-local"
              className="input mt-1"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Estimated hours</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              className="input mt-1"
              value={form.estimatedHours}
              onChange={(e) => setForm((f) => ({ ...f, estimatedHours: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input mt-1"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input mt-1"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={addDeadline}>
              Add deadline
            </button>
          </div>
        </div>
      )}

      <DeadlineGroup title="Overdue" items={grouped.overdue} tone="danger" setStatus={setStatus} remove={remove} />
      <DeadlineGroup title="Due soon" items={grouped.dueSoon} tone="warning" setStatus={setStatus} remove={remove} />
      <DeadlineGroup title="Upcoming" items={grouped.upcoming} tone="default" setStatus={setStatus} remove={remove} />
      <DeadlineGroup title="Done" items={grouped.done} tone="muted" setStatus={setStatus} remove={remove} collapsedByDefault />
    </div>
  );
}

function DeadlineGroup({
  title,
  items,
  tone,
  setStatus,
  remove,
  collapsedByDefault,
}: {
  title: string;
  items: Deadline[];
  tone: "danger" | "warning" | "default" | "muted";
  setStatus: (id: string, status: Deadline["status"]) => void;
  remove: (id: string) => void;
  collapsedByDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedByDefault);
  if (!items.length) return null;

  const toneClass = {
    danger: "text-danger",
    warning: "text-warning",
    default: "text-foreground",
    muted: "text-muted",
  }[tone];

  return (
    <div>
      <button
        className={`mb-3 flex items-center gap-2 text-sm font-semibold ${toneClass}`}
        onClick={() => setOpen((o) => !o)}
      >
        {title} ({items.length}) <span className="text-xs text-muted">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          {items.map((d) => (
            <div key={d.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{d.title}</span>
                  <span className="badge text-muted">{d.priority}</span>
                  {d.externalId && <span className="badge text-accent-2">CourseWeb</span>}
                </div>
                <p className="text-xs text-muted">
                  {d.course} · due {new Date(d.dueDate).toLocaleString()} · ~{d.estimatedHours}h
                </p>
                {d.notes && <p className="mt-1 text-xs text-muted">{d.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                {d.status !== "done" ? (
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => setStatus(d.id, d.status === "in-progress" ? "done" : "in-progress")}
                  >
                    {d.status === "in-progress" ? "Mark done" : "Start"}
                  </button>
                ) : (
                  <button className="btn-ghost text-xs" onClick={() => setStatus(d.id, "pending")}>
                    Reopen
                  </button>
                )}
                <button className="text-xs text-danger hover:underline" onClick={() => remove(d.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
