export type Priority = "low" | "medium" | "high";

export type DeadlineType = "assignment" | "project" | "exam" | "other";

export type DeadlineStatus = "pending" | "in-progress" | "done";

export interface Deadline {
  id: string;
  title: string;
  course: string;
  type: DeadlineType;
  dueDate: string; // ISO datetime
  estimatedHours: number;
  priority: Priority;
  status: DeadlineStatus;
  notes?: string;
  createdAt: string;
  /** Present when imported from an external calendar (e.g. CourseWeb/Moodle) — used to dedupe re-syncs. */
  externalId?: string;
  sourceUrl?: string;
}

export type SessionCategory =
  | "coursework"
  | "skill-building"
  | "job-search"
  | "project";

export interface WorkSession {
  id: string;
  date: string; // ISO date (yyyy-MM-dd)
  durationMinutes: number;
  category: SessionCategory;
  label: string;
  linkedDeadlineId?: string;
  createdAt: string;
}

export interface SkillGoal {
  id: string;
  title: string;
  estimatedHours: number;
  hoursLogged: number;
  priority: Priority;
  createdAt: string;
}

export interface SkillProfile {
  skills: string[];
  targetRoles: string[];
  locationPreference: "remote" | "sri-lanka" | "both";
}

export interface Settings {
  anthropicApiKey: string;
  aiModel: string;
  githubUsername: string;
  dailyFreeHours: number;
  workDays: number[]; // 0=Sun..6=Sat
  reminderWindowHours: number;
  coursewebIcsUrl: string;
  coursewebLastSynced: string;
  /** Personal access token used only client-side to publish portfolio content edits to GitHub. */
  githubPublishToken: string;
  githubPublishBranch: string;
}

export type PlanBlockType = "coursework" | "skill-building" | "job-search";

export interface PlanBlock {
  id: string;
  date: string; // ISO date
  title: string;
  hours: number;
  type: PlanBlockType;
  sourceId?: string;
  reason: string;
}

export interface DayPlan {
  date: string;
  blocks: PlanBlock[];
  totalHours: number;
}

export interface RemoteJob {
  id: string;
  source: "remoteok";
  title: string;
  company: string;
  tags: string[];
  url: string;
  location: string;
  workMode: "remote";
  postedAt?: string;
  logo?: string;
}

export interface LocalJob {
  id: string;
  source: "curated-lk";
  title: string;
  company: string;
  tags: string[];
  url: string;
  location: string;
  workMode: "onsite" | "hybrid";
  postedAt?: string;
}

export type AnyJob = RemoteJob | LocalJob;

export interface ScoredJob {
  job: AnyJob;
  score: number;
  matched: string[];
  missing: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
