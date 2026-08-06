"use client";

import { useLocalStorage } from "./useLocalStorage";
import type {
  Deadline,
  Settings,
  SkillGoal,
  SkillProfile,
  WorkSession,
  ChatMessage,
} from "./types";
import type { ProfileData } from "@/data/profile";
import { profile, heroStats, skillCategories, certifications, projects } from "@/data/profile";

export const STORAGE_KEYS = {
  deadlines: "portfolio:deadlines",
  sessions: "portfolio:sessions",
  skillGoals: "portfolio:skill-goals",
  skillProfile: "portfolio:skill-profile",
  settings: "portfolio:settings",
  chat: "portfolio:chat",
  contentDraft: "portfolio:content-draft",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  anthropicApiKey: "",
  aiModel: "claude-sonnet-5",
  githubUsername: "",
  dailyFreeHours: 3,
  workDays: [0, 1, 2, 3, 4, 5, 6],
  reminderWindowHours: 48,
  coursewebIcsUrl: "",
  coursewebLastSynced: "",
  githubPublishToken: "",
  githubPublishBranch: "main",
};

export const DEFAULT_SKILL_PROFILE: SkillProfile = {
  skills: [],
  targetRoles: [],
  locationPreference: "both",
};

export function useDeadlines() {
  return useLocalStorage<Deadline[]>(STORAGE_KEYS.deadlines, []);
}

export function useSessions() {
  return useLocalStorage<WorkSession[]>(STORAGE_KEYS.sessions, []);
}

export function useSkillGoals() {
  return useLocalStorage<SkillGoal[]>(STORAGE_KEYS.skillGoals, []);
}

export function useSkillProfile() {
  return useLocalStorage<SkillProfile>(
    STORAGE_KEYS.skillProfile,
    DEFAULT_SKILL_PROFILE,
  );
}

export function useSettings() {
  return useLocalStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function useChatHistory() {
  return useLocalStorage<ChatMessage[]>(STORAGE_KEYS.chat, []);
}

const DEFAULT_CONTENT_DRAFT: ProfileData = {
  profile,
  heroStats,
  skillCategories,
  certifications,
  projects,
};

/** Editable draft of portfolio content, seeded from the currently-published src/data/profile.ts. */
export function useContentDraft() {
  const [stored, setStored, hydrated] = useLocalStorage<ProfileData>(
    STORAGE_KEYS.contentDraft,
    DEFAULT_CONTENT_DRAFT,
  );
  // Backfills fields added to ProfileData after a draft was already saved to localStorage,
  // so old saved drafts don't crash the editor when new fields are read off them.
  const draft: ProfileData = {
    profile: stored.profile ?? DEFAULT_CONTENT_DRAFT.profile,
    heroStats: stored.heroStats ?? DEFAULT_CONTENT_DRAFT.heroStats,
    skillCategories: stored.skillCategories ?? DEFAULT_CONTENT_DRAFT.skillCategories,
    certifications: stored.certifications ?? DEFAULT_CONTENT_DRAFT.certifications,
    projects: stored.projects ?? DEFAULT_CONTENT_DRAFT.projects,
  };
  return [draft, setStored, hydrated] as const;
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
