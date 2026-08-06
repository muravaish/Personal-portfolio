"use client";

import { useState } from "react";
import { useSettings } from "@/lib/store";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SettingsView() {
  const [settings, setSettings, hydrated] = useSettings();
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
  );
  const [showCoursewebHelp, setShowCoursewebHelp] = useState(false);

  if (!hydrated) return null;

  function toggleDay(day: number) {
    setSettings((s) => ({
      ...s,
      workDays: s.workDays.includes(day)
        ? s.workDays.filter((d) => d !== day)
        : [...s.workDays, day].sort(),
    }));
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">
          Everything here is stored only in this browser&apos;s local storage — nothing is sent to any server except
          the direct API calls each feature needs (CourseWeb sync, GitHub activity, RemoteOK, and the AI assistant if
          you add a key).
        </p>
      </div>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">CourseWeb (Moodle) sync</h2>
        <p className="text-xs text-muted">
          Paste your personal calendar export URL to pull real assignment/quiz deadlines automatically.
        </p>
        <input
          className="input"
          placeholder="https://courseweb.example.ac.lk/calendar/export_execute.php?userid=...&authtoken=..."
          value={settings.coursewebIcsUrl}
          onChange={(e) => setSettings((s) => ({ ...s, coursewebIcsUrl: e.target.value }))}
        />
        <button
          type="button"
          className="self-start text-xs text-accent-2 hover:underline"
          onClick={() => setShowCoursewebHelp((v) => !v)}
        >
          {showCoursewebHelp ? "Hide" : "How do I get this URL?"}
        </button>
        {showCoursewebHelp && (
          <ol className="list-decimal space-y-1 pl-5 text-xs text-muted">
            <li>Log into CourseWeb as usual (via your Microsoft SSO).</li>
            <li>Click your profile picture (top-right) → Preferences.</li>
            <li>Under &quot;Calendar&quot;, click &quot;Export calendar&quot;.</li>
            <li>Choose an event range (e.g. &quot;Recent and next 60 days&quot;), export type &quot;Calendar URL&quot;.</li>
            <li>Click &quot;Get calendar URL&quot; and copy the generated link — paste it above.</li>
          </ol>
        )}
        <p className="text-xs text-warning">
          Never paste your Microsoft account password anywhere in this app — this URL contains a private token only,
          not your login credentials.
        </p>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">AI Assistant</h2>
        <p className="text-xs text-muted">
          Bring your own Anthropic API key to unlock free-form chat. Without a key, the assistant still answers
          questions about your tracked data using built-in logic.
        </p>
        <label className="label">Anthropic API key</label>
        <input
          type="password"
          className="input"
          placeholder="sk-ant-..."
          value={settings.anthropicApiKey}
          onChange={(e) => setSettings((s) => ({ ...s, anthropicApiKey: e.target.value }))}
        />
        <label className="label">Model</label>
        <input
          className="input"
          value={settings.aiModel}
          onChange={(e) => setSettings((s) => ({ ...s, aiModel: e.target.value }))}
        />
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">GitHub activity</h2>
        <label className="label">GitHub username</label>
        <input
          className="input"
          placeholder="your-username"
          value={settings.githubUsername}
          onChange={(e) => setSettings((s) => ({ ...s, githubUsername: e.target.value }))}
        />
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Publish Portfolio Content</h2>
        <p className="text-xs text-muted">
          Lets the Portfolio Content editor (Dashboard → Portfolio Content) commit your skills/projects/certifications
          edits straight to your GitHub repo — no code, no zip files. Create a{" "}
          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
            className="text-accent-2 hover:underline"
          >
            fine-grained personal access token
          </a>{" "}
          scoped to just this repository with <strong>Contents: Read and write</strong> permission, and paste it
          below. It&apos;s stored only in this browser and sent only to GitHub&apos;s API.
        </p>
        <label className="label">GitHub personal access token</label>
        <input
          type="password"
          className="input"
          placeholder="github_pat_..."
          value={settings.githubPublishToken}
          onChange={(e) => setSettings((s) => ({ ...s, githubPublishToken: e.target.value }))}
        />
        <label className="label">Branch to publish to</label>
        <input
          className="input"
          placeholder="main"
          value={settings.githubPublishBranch}
          onChange={(e) => setSettings((s) => ({ ...s, githubPublishBranch: e.target.value }))}
        />
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Scheduling preferences</h2>
        <label className="label">Daily free hours for study/build time</label>
        <input
          type="number"
          min={0.5}
          step={0.5}
          className="input"
          value={settings.dailyFreeHours}
          onChange={(e) => setSettings((s) => ({ ...s, dailyFreeHours: Number(e.target.value) }))}
        />
        <label className="label">Work days</label>
        <div className="flex gap-2">
          {DOW.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                settings.workDays.includes(i) ? "bg-accent/20 text-foreground" : "bg-white/5 text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="label">Remind me when due within (hours)</label>
        <input
          type="number"
          min={1}
          className="input"
          value={settings.reminderWindowHours}
          onChange={(e) => setSettings((s) => ({ ...s, reminderWindowHours: Number(e.target.value) }))}
        />
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Browser notifications</h2>
        <p className="text-xs text-muted">
          Status: <span className="font-medium">{notifStatus}</span>
        </p>
        {notifStatus !== "granted" && notifStatus !== "unsupported" && (
          <button className="btn-ghost w-fit text-xs" onClick={enableNotifications}>
            Enable notifications
          </button>
        )}
      </section>
    </div>
  );
}
