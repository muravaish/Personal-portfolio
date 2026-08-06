"use client";

import { useEffect, useMemo, useState } from "react";
import { useSkillProfile } from "@/lib/store";
import type { AnyJob, LocalJob, RemoteJob } from "@/lib/types";
import { matchesLocationPreference, rankJobs } from "@/lib/jobMatch";
import localJobsRaw from "@/data/local-jobs-lk.json";

const localJobs = localJobsRaw as LocalJob[];

export function JobsView() {
  const [profile, setProfile, hydrated] = useSkillProfile();
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/jobs/remoteok")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load remote jobs.");
        setRemoteJobs(data.jobs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allJobs: AnyJob[] = useMemo(() => [...remoteJobs, ...localJobs], [remoteJobs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allJobs.filter((j) => {
      if (!matchesLocationPreference(j, profile.locationPreference)) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allJobs, profile.locationPreference, search]);

  const ranked = useMemo(() => rankJobs(filtered, profile).slice(0, 40), [filtered, profile]);

  function addSkill() {
    const v = skillInput.trim();
    if (!v || profile.skills.includes(v)) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, v] }));
    setSkillInput("");
  }
  function removeSkill(s: string) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  }
  function addRole() {
    const v = roleInput.trim();
    if (!v || profile.targetRoles.includes(v)) return;
    setProfile((p) => ({ ...p, targetRoles: [...p.targetRoles, v] }));
    setRoleInput("");
  }
  function removeRole(r: string) {
    setProfile((p) => ({ ...p, targetRoles: p.targetRoles.filter((x) => x !== r) }));
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job Matcher</h1>
        <p className="text-sm text-muted">
          Live remote listings from RemoteOK, ranked against your skills, plus a curated sample of onsite/hybrid
          roles in Sri Lanka (see note below).
        </p>
      </div>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold">Your skill profile</h2>
        <div>
          <label className="label">Skills</label>
          <div className="mt-1 flex gap-2">
            <input
              className="input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="e.g. React"
            />
            <button className="btn-ghost text-xs" onClick={addSkill}>
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <button key={s} className="badge text-foreground/80" onClick={() => removeSkill(s)} title="Remove">
                {s} ✕
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Target roles</label>
          <div className="mt-1 flex gap-2">
            <input
              className="input"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRole()}
              placeholder="e.g. Frontend Developer"
            />
            <button className="btn-ghost text-xs" onClick={addRole}>
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.targetRoles.map((r) => (
              <button key={r} className="badge text-foreground/80" onClick={() => removeRole(r)} title="Remove">
                {r} ✕
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Location preference</label>
          <select
            className="input mt-1 w-auto"
            value={profile.locationPreference}
            onChange={(e) => setProfile((p) => ({ ...p, locationPreference: e.target.value as typeof p.locationPreference }))}
          >
            <option value="both">Remote or Sri Lanka (onsite/hybrid)</option>
            <option value="remote">Remote only</option>
            <option value="sri-lanka">Sri Lanka onsite/hybrid only</option>
          </select>
        </div>
      </section>

      <input
        className="input"
        placeholder="Search title, company, or skill…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="text-xs text-muted">Loading live remote listings…</p>}
      {error && <p className="text-xs text-danger">{error}</p>}

      <p className="text-xs text-muted">
        Remote listings are live from RemoteOK. Sri Lanka onsite/hybrid entries are a small curated sample (no free
        public API exists for local job boards) — edit{" "}
        <code className="rounded bg-[var(--overlay-soft-hover)] px-1">src/data/local-jobs-lk.json</code> to refresh them, or swap in a
        real feed later.
      </p>

      <div className="flex flex-col gap-3">
        {ranked.map(({ job, score, matched, missing }) => (
          <div key={job.id} className="card flex flex-col gap-2 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-xs text-muted">
                  {job.company} · {job.location} ·{" "}
                  <span className="badge">{job.workMode}</span>
                  {job.source === "curated-lk" && <span className="badge ml-1 text-warning">sample</span>}
                </p>
              </div>
              {profile.skills.length > 0 && (
                <span className={`badge ${score >= 50 ? "text-success" : score >= 25 ? "text-warning" : "text-muted"}`}>
                  {score}% match
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((m) => (
                <span key={m} className="badge text-success">
                  {m}
                </span>
              ))}
              {missing.slice(0, 6).map((m) => (
                <span key={m} className="badge text-muted">
                  {m}
                </span>
              ))}
            </div>
            <a href={job.url} target="_blank" rel="noreferrer" className="w-fit text-xs text-accent-2 hover:underline">
              View listing ↗
            </a>
          </div>
        ))}
        {!loading && ranked.length === 0 && <p className="text-sm text-muted">No jobs match your current filters.</p>}
      </div>
    </div>
  );
}
