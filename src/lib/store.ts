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

export const STORAGE_KEYS = {
  deadlines: "portfolio:deadlines",
  sessions: "portfolio:sessions",
  skillGoals: "portfolio:skill-goals",
  skillProfile: "portfolio:skill-profile",
  settings: "portfolio:settings",
  chat: "portfolio:chat",
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

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
