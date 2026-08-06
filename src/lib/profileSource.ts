import type { ProfileData } from "@/data/profile";

/** Renders a ProfileData object back into the exact source of src/data/profile.ts. */
export function serializeProfileFile(data: ProfileData): string {
  return `// Edit this file directly, or use the in-app editor (Dashboard → Portfolio
// Content) to add/edit skills, projects, and certifications without touching
// code — it publishes changes here automatically via your GitHub token.

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
  kaggle: string;
}

export interface ProfileBasics {
  name: string;
  role: string;
  location: string;
  tagline: string;
  bio: string;
  email: string;
  socials: SocialLinks;
  resumeUrl: string;
}

export const profile: ProfileBasics = ${JSON.stringify(data.profile, null, 2)};

export interface StatHighlight {
  label: string;
  value: string;
}

export const heroStats: StatHighlight[] = ${JSON.stringify(data.heroStats, null, 2)};

export interface SkillCategory {
  label: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = ${JSON.stringify(data.skillCategories, null, 2)};

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
  imageUrl?: string;
}

export const certifications: Certification[] = ${JSON.stringify(data.certifications, null, 2)};

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repoUrl?: string;
  highlight?: boolean;
  imageUrl?: string;
  videoUrl?: string;
}

export const projects: Project[] = ${JSON.stringify(data.projects, null, 2)};

export interface ProfileData {
  profile: ProfileBasics;
  heroStats: StatHighlight[];
  skillCategories: SkillCategory[];
  certifications: Certification[];
  projects: Project[];
}
`;
}
