// Edit this file with your real details — everything on the public portfolio
// pages (Hero, About, Skills, Projects, Contact) is sourced from here.

export const profile = {
  name: "Your Name",
  role: "Software Engineer",
  location: "Sri Lanka",
  tagline: "I build things, ship them, and track myself getting better at it.",
  bio: "Undergraduate developer balancing coursework with hands-on projects and job-ready skill building. This site doubles as my personal command center — it tracks my university deadlines, plans my study/build time, logs my activity, and matches me against jobs that fit my skills.",
  email: "you@example.com",
  socials: {
    github: "https://github.com/your-username",
    linkedin: "https://linkedin.com/in/your-username",
    twitter: "",
  },
  resumeUrl: "",
};

export const skillCategories: { label: string; skills: string[] }[] = [
  {
    label: "Languages",
    skills: ["TypeScript", "JavaScript", "Python", "Java", "SQL"],
  },
  {
    label: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "REST APIs", "PostgreSQL"],
  },
  {
    label: "Tools",
    skills: ["Git", "Docker", "Linux"],
  },
];

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

export const certifications: Certification[] = [
  {
    id: "cert-one",
    title: "Certification Name",
    issuer: "Issuing Organization",
    date: "2026",
    url: "",
  },
];

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repoUrl?: string;
  highlight?: boolean;
}

export const projects: Project[] = [
  {
    id: "portfolio-command-center",
    title: "This Portfolio + Command Center",
    description:
      "A portfolio that's also a working productivity system: real CourseWeb deadline sync, a heuristic day-planner that balances coursework with job-prep, a GitHub + self-logged activity tracker, a skill-matched job board, and a BYO-key AI assistant.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Anthropic API"],
    repoUrl: "",
    highlight: true,
  },
  {
    id: "project-two",
    title: "Second Project",
    description: "Short description of what it does and why it's interesting.",
    tags: ["Add", "Tech", "Tags"],
    url: "",
    repoUrl: "",
  },
  {
    id: "project-three",
    title: "Third Project",
    description: "Short description of what it does and why it's interesting.",
    tags: ["Add", "Tech", "Tags"],
    url: "",
    repoUrl: "",
  },
];
