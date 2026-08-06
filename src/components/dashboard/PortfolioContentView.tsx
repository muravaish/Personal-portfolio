"use client";

import { useState } from "react";
import Link from "next/link";
import { useContentDraft, useSettings, uid } from "@/lib/store";
import type { Certification, Project, SkillCategory, StatHighlight } from "@/data/profile";
import { serializeProfileFile } from "@/lib/profileSource";
import { publishProfileFile, publishPublicAsset } from "@/lib/githubContent";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setInput("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-ghost text-xs" onClick={add}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              className="badge text-foreground/80"
              title="Remove"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              {v} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PortfolioContentView() {
  const [draft, setDraft, hydrated] = useContentDraft();
  const [settings] = useSettings();
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; url?: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  if (!hydrated) return null;

  const hasToken = Boolean(settings.githubPublishToken);

  function updateProfileField<K extends keyof typeof draft.profile>(key: K, value: (typeof draft.profile)[K]) {
    setDraft((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  }

  function updateSocial(key: keyof typeof draft.profile.socials, value: string) {
    setDraft((d) => ({ ...d, profile: { ...d.profile, socials: { ...d.profile.socials, [key]: value } } }));
  }

  function addHeroStat() {
    const s: StatHighlight = { label: "New Stat", value: "" };
    setDraft((d) => ({ ...d, heroStats: [...d.heroStats, s] }));
  }
  function updateHeroStat(index: number, patch: Partial<StatHighlight>) {
    setDraft((d) => ({
      ...d,
      heroStats: d.heroStats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }
  function removeHeroStat(index: number) {
    setDraft((d) => ({ ...d, heroStats: d.heroStats.filter((_, i) => i !== index) }));
  }

  function addCategory() {
    setDraft((d) => ({ ...d, skillCategories: [...d.skillCategories, { label: "New Category", skills: [] }] }));
  }
  function updateCategory(index: number, next: SkillCategory) {
    setDraft((d) => ({
      ...d,
      skillCategories: d.skillCategories.map((c, i) => (i === index ? next : c)),
    }));
  }
  function removeCategory(index: number) {
    setDraft((d) => ({ ...d, skillCategories: d.skillCategories.filter((_, i) => i !== index) }));
  }

  function addProject() {
    const p: Project = { id: uid(), title: "New Project", description: "", tags: [] };
    setDraft((d) => ({ ...d, projects: [...d.projects, p] }));
  }
  function updateProject(id: string, patch: Partial<Project>) {
    setDraft((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }
  function removeProject(id: string) {
    setDraft((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  }

  function addCertification() {
    const c: Certification = { id: uid(), title: "New Certification", issuer: "", date: "" };
    setDraft((d) => ({ ...d, certifications: [...d.certifications, c] }));
  }
  function updateCertification(id: string, patch: Partial<Certification>) {
    setDraft((d) => ({
      ...d,
      certifications: d.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }
  function removeCertification(id: string) {
    setDraft((d) => ({ ...d, certifications: d.certifications.filter((c) => c.id !== id) }));
  }

  async function uploadCertificationImage(cert: Certification, file: File) {
    setUploadErrors((prev) => ({ ...prev, [cert.id]: "" }));
    if (!settings.githubPublishToken) {
      setUploadErrors((prev) => ({ ...prev, [cert.id]: "Add a GitHub token in Settings first." }));
      return;
    }
    setUploadingId(cert.id);
    try {
      const base64 = await readFileAsBase64(file);
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const filename = `${cert.id}${ext}`;
      const res = await publishPublicAsset(
        settings.githubPublishToken,
        settings.githubPublishBranch || "main",
        filename,
        base64,
        `Add certificate image for ${cert.title}`,
      );
      if (res.success && res.publicPath) {
        updateCertification(cert.id, { imageUrl: res.publicPath });
      } else {
        setUploadErrors((prev) => ({ ...prev, [cert.id]: res.error || "Upload failed." }));
      }
    } catch (e) {
      setUploadErrors((prev) => ({
        ...prev,
        [cert.id]: e instanceof Error ? e.message : "Upload failed.",
      }));
    } finally {
      setUploadingId(null);
    }
  }

  async function publish() {
    setPublishing(true);
    setResult(null);
    const source = serializeProfileFile(draft);
    const res = await publishProfileFile(
      settings.githubPublishToken,
      settings.githubPublishBranch || "main",
      source,
      "Update portfolio content",
    );
    setPublishing(false);
    if (res.success) {
      setResult({ ok: true, message: "Published. Your site will update shortly once it redeploys.", url: res.commitUrl });
    } else {
      setResult({ ok: false, message: res.error || "Publish failed." });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio Content</h1>
          <p className="text-sm text-muted">
            Edit your public portfolio&apos;s profile, skills, projects, and certifications here — publish to push it
            live.
          </p>
        </div>
        <button className="btn-primary" onClick={publish} disabled={publishing || !hasToken}>
          {publishing ? "Publishing…" : "Publish to GitHub"}
        </button>
      </div>

      {!hasToken && (
        <div className="card border-warning/30 p-4 text-sm text-warning">
          Add a GitHub personal access token in{" "}
          <Link href="/dashboard/settings" className="underline">
            Settings
          </Link>{" "}
          before you can publish.
        </div>
      )}

      {result && (
        <div className={`card p-4 text-sm ${result.ok ? "border-success/30 text-success" : "border-danger/30 text-danger"}`}>
          {result.message}
          {result.url && (
            <>
              {" "}
              <a href={result.url} target="_blank" rel="noreferrer" className="underline">
                View commit ↗
              </a>
            </>
          )}
        </div>
      )}

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input mt-1" value={draft.profile.name} onChange={(e) => updateProfileField("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input mt-1" value={draft.profile.role} onChange={(e) => updateProfileField("role", e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input mt-1" value={draft.profile.location} onChange={(e) => updateProfileField("location", e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" value={draft.profile.email} onChange={(e) => updateProfileField("email", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Tagline</label>
            <input className="input mt-1" value={draft.profile.tagline} onChange={(e) => updateProfileField("tagline", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bio</label>
            <textarea className="input mt-1" rows={3} value={draft.profile.bio} onChange={(e) => updateProfileField("bio", e.target.value)} />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input className="input mt-1" value={draft.profile.socials.github} onChange={(e) => updateSocial("github", e.target.value)} />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input mt-1" value={draft.profile.socials.linkedin} onChange={(e) => updateSocial("linkedin", e.target.value)} />
          </div>
          <div>
            <label className="label">Twitter/X URL</label>
            <input className="input mt-1" value={draft.profile.socials.twitter} onChange={(e) => updateSocial("twitter", e.target.value)} />
          </div>
          <div>
            <label className="label">Kaggle URL</label>
            <input className="input mt-1" value={draft.profile.socials.kaggle} onChange={(e) => updateSocial("kaggle", e.target.value)} />
          </div>
          <div>
            <label className="label">Resume URL</label>
            <input className="input mt-1" value={draft.profile.resumeUrl} onChange={(e) => updateProfileField("resumeUrl", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Hero Stats</h2>
            <p className="text-xs text-muted">The real numbers shown in the hero — e.g. a model&apos;s accuracy or an eval score.</p>
          </div>
          <button type="button" className="btn-ghost text-xs" onClick={addHeroStat}>
            + Add stat
          </button>
        </div>
        {draft.heroStats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input"
              value={s.value}
              onChange={(e) => updateHeroStat(i, { value: e.target.value })}
              placeholder="e.g. 84.51%"
            />
            <input
              className="input"
              value={s.label}
              onChange={(e) => updateHeroStat(i, { label: e.target.value })}
              placeholder="e.g. ROC-AUC"
            />
            <button type="button" className="text-xs text-danger hover:underline whitespace-nowrap" onClick={() => removeHeroStat(i)}>
              Delete
            </button>
          </div>
        ))}
        {draft.heroStats.length === 0 && <p className="text-xs text-muted">No hero stats yet.</p>}
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Skills</h2>
          <button type="button" className="btn-ghost text-xs" onClick={addCategory}>
            + Add category
          </button>
        </div>
        {draft.skillCategories.map((cat, i) => (
          <div key={i} className="rounded-lg bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <input
                className="input"
                value={cat.label}
                onChange={(e) => updateCategory(i, { ...cat, label: e.target.value })}
              />
              <button type="button" className="text-xs text-danger hover:underline" onClick={() => removeCategory(i)}>
                Delete
              </button>
            </div>
            <TagInput
              values={cat.skills}
              onChange={(skills) => updateCategory(i, { ...cat, skills })}
              placeholder="e.g. Python"
            />
          </div>
        ))}
        {draft.skillCategories.length === 0 && <p className="text-xs text-muted">No skill categories yet.</p>}
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Projects</h2>
          <button type="button" className="btn-ghost text-xs" onClick={addProject}>
            + Add project
          </button>
        </div>
        {draft.projects.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 rounded-lg bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <input
                className="input"
                value={p.title}
                onChange={(e) => updateProject(p.id, { title: e.target.value })}
                placeholder="Project title"
              />
              <button type="button" className="text-xs text-danger hover:underline whitespace-nowrap" onClick={() => removeProject(p.id)}>
                Delete
              </button>
            </div>
            <textarea
              className="input"
              rows={2}
              value={p.description}
              onChange={(e) => updateProject(p.id, { description: e.target.value })}
              placeholder="Short description"
            />
            <TagInput values={p.tags} onChange={(tags) => updateProject(p.id, { tags })} placeholder="e.g. React" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                value={p.url || ""}
                onChange={(e) => updateProject(p.id, { url: e.target.value })}
                placeholder="Live URL (optional)"
              />
              <input
                className="input"
                value={p.repoUrl || ""}
                onChange={(e) => updateProject(p.id, { repoUrl: e.target.value })}
                placeholder="Repo URL (optional)"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={Boolean(p.highlight)}
                onChange={(e) => updateProject(p.id, { highlight: e.target.checked })}
              />
              Highlight (spans full width)
            </label>
          </div>
        ))}
        {draft.projects.length === 0 && <p className="text-xs text-muted">No projects yet.</p>}
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Certifications</h2>
          <button type="button" className="btn-ghost text-xs" onClick={addCertification}>
            + Add certification
          </button>
        </div>
        {draft.certifications.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-lg bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                className="input"
                value={c.title}
                onChange={(e) => updateCertification(c.id, { title: e.target.value })}
                placeholder="Title"
              />
              <input
                className="input"
                value={c.issuer}
                onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                placeholder="Issuer"
              />
              <input
                className="input sm:w-28"
                value={c.date}
                onChange={(e) => updateCertification(c.id, { date: e.target.value })}
                placeholder="Year"
              />
              <input
                className="input"
                value={c.url || ""}
                onChange={(e) => updateCertification(c.id, { url: e.target.value })}
                placeholder="Verify URL (optional)"
              />
              <button
                type="button"
                className="text-xs text-danger hover:underline whitespace-nowrap"
                onClick={() => removeCertification(c.id)}
              >
                Delete
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageUrl}
                  alt={`${c.title} certificate preview`}
                  className="h-16 w-24 rounded object-cover"
                />
              )}
              <label className="btn-ghost cursor-pointer text-xs">
                {uploadingId === c.id ? "Uploading…" : c.imageUrl ? "Replace image" : "Upload certificate image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingId === c.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) uploadCertificationImage(c, file);
                  }}
                />
              </label>
              {c.imageUrl && (
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() => updateCertification(c.id, { imageUrl: undefined })}
                >
                  Remove image
                </button>
              )}
              {uploadErrors[c.id] && <span className="text-xs text-danger">{uploadErrors[c.id]}</span>}
            </div>
          </div>
        ))}
        {draft.certifications.length === 0 && <p className="text-xs text-muted">No certifications yet.</p>}
      </section>
    </div>
  );
}
