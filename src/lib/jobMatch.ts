import type { AnyJob, ScoredJob, SkillProfile } from "./types";

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Loose match: exact, substring, or shared word token. */
function skillMatches(skill: string, tag: string) {
  const a = norm(skill);
  const b = norm(tag);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aWords = new Set(a.split(/[\s/.+-]+/).filter(Boolean));
  const bWords = new Set(b.split(/[\s/.+-]+/).filter(Boolean));
  for (const w of aWords) {
    if (w.length > 2 && bWords.has(w)) return true;
  }
  return false;
}

export function scoreJob(job: AnyJob, profile: SkillProfile): ScoredJob {
  const matched = new Set<string>();
  const jobTags = job.tags.length ? job.tags : [];

  for (const skill of profile.skills) {
    if (jobTags.some((t) => skillMatches(skill, t))) {
      matched.add(skill);
    }
  }

  const missing = jobTags.filter(
    (t) => !profile.skills.some((s) => skillMatches(s, t)),
  );

  const denom = Math.max(profile.skills.length, 1);
  const rawScore = (matched.size / denom) * 100;
  // Small boost for jobs where most of the required tags are covered too.
  const coverage = jobTags.length ? (jobTags.length - missing.length) / jobTags.length : 0;
  const score = Math.round(Math.min(100, rawScore * 0.7 + coverage * 100 * 0.3));

  return { job, score, matched: Array.from(matched), missing };
}

export function rankJobs(jobs: AnyJob[], profile: SkillProfile): ScoredJob[] {
  if (!profile.skills.length) {
    return jobs.map((job) => ({ job, score: 0, matched: [], missing: job.tags }));
  }
  return jobs
    .map((job) => scoreJob(job, profile))
    .sort((a, b) => b.score - a.score);
}

export function matchesLocationPreference(job: AnyJob, pref: SkillProfile["locationPreference"]) {
  if (pref === "both") return true;
  if (pref === "remote") return job.workMode === "remote";
  return job.workMode === "onsite" || job.workMode === "hybrid";
}
