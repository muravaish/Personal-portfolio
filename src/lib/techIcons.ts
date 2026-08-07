import {
  siPython,
  siGithub,
  siGmail,
  siKaggle,
  siTypescript,
  siPostgresql,
  siJupyter,
  siGit,
  siDocker,
  siReact,
  siNodedotjs,
  siExpress,
  siLeaflet,
  siNextdotjs,
  siTailwindcss,
  siPandas,
  siNumpy,
  siScikitlearn,
  siStreamlit,
  siMlflow,
  siLanggraph,
  siAnthropic,
  siVite,
  siGooglegemini,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

/**
 * Maps skill/tag/social names to real brand icons (simple-icons). Only
 * entries with an accurate, available logo are included — brands like
 * LinkedIn, Tableau, Power BI, and Matplotlib aren't in simple-icons, so
 * those tags render as plain text rather than a wrong or invented icon.
 */
const ICONS: Record<string, SimpleIcon> = {
  python: siPython,
  github: siGithub,
  gmail: siGmail,
  kaggle: siKaggle,
  typescript: siTypescript,
  postgresql: siPostgresql,
  jupyter: siJupyter,
  git: siGit,
  docker: siDocker,
  react: siReact,
  "node.js": siNodedotjs,
  nodejs: siNodedotjs,
  express: siExpress,
  leaflet: siLeaflet,
  "next.js": siNextdotjs,
  nextjs: siNextdotjs,
  "tailwind css": siTailwindcss,
  tailwindcss: siTailwindcss,
  pandas: siPandas,
  numpy: siNumpy,
  "scikit-learn": siScikitlearn,
  streamlit: siStreamlit,
  mlflow: siMlflow,
  langgraph: siLanggraph,
  "anthropic api": siAnthropic,
  anthropic: siAnthropic,
  vite: siVite,
  gemini: siGooglegemini,
};

export function getTechIcon(name: string): SimpleIcon | undefined {
  return ICONS[name.trim().toLowerCase()];
}
