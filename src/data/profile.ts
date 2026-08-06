// Edit this file directly, or use the in-app editor (Dashboard → Portfolio
// Content) to add/edit skills, projects, and certifications without touching
// code — it publishes changes here automatically via your GitHub token.

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
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

export const profile: ProfileBasics = {
  name: "Vaishmitha Muralitharan",
  role: "Data Science Undergraduate",
  location: "Sri Lanka",
  tagline: "I turn data into decisions, ship projects, and track myself getting better at it.",
  bio: "Undergraduate specializing in Data Science, balancing coursework with hands-on projects and job-ready skill building. This site doubles as my personal command center — it tracks my university deadlines, plans my study/build time, logs my activity, and matches me against jobs that fit my skills.",
  email: "vaishmitha.m@gmail.com",
  socials: {
    github: "https://github.com/muravaish",
    linkedin: "https://www.linkedin.com/in/vaishmitha-muralitharan/",
    twitter: "",
  },
  resumeUrl: "",
};

export interface SkillCategory {
  label: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Languages",
    skills: ["Python", "SQL", "R", "TypeScript"],
  },
  {
    label: "Data Science",
    skills: ["Pandas", "NumPy", "scikit-learn", "Machine Learning"],
  },
  {
    label: "Visualization",
    skills: ["Matplotlib", "Power BI", "Tableau"],
  },
  {
    label: "Tools",
    skills: ["Jupyter", "Git", "PostgreSQL"],
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
    repoUrl: "https://github.com/muravaish/Personal-portfolio",
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

export interface ProfileData {
  profile: ProfileBasics;
  skillCategories: SkillCategory[];
  certifications: Certification[];
  projects: Project[];
}
