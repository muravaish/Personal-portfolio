// Edit this file directly, or use the in-app editor (Dashboard → Portfolio
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
  phone?: string;
  socials: SocialLinks;
  resumeUrl: string;
  photoUrl?: string;
}

export const profile: ProfileBasics = {
  "name": "Vaishmitha Muralitharan",
  "role": "Data Science Undergraduate",
  "location": "Kandy, Sri Lanka",
  "tagline": "I build systems that turn messy data into decisions people act on — multi-agent analytics, churn modelling, recommendation engines.",
  "bio": "I'm in my third year of BSc (Hons) Information Technology at SLIIT, specializing in Data Science. Most of what I know came from finishing projects: an autonomous analytics agent, a churn prediction and retention platform, a psychometric travel planner. I care about the part after the model — the dashboard a non-technical stakeholder can read, the recommendation that names a next step, the evaluation that proves the numbers are grounded.",
  "email": "vaishmitha.m@gmail.com",
  "phone": "+94 77 658 5217",
  "socials": {
    "github": "https://github.com/muravaish",
    "linkedin": "https://www.linkedin.com/in/vaishmitha-muralitharan/",
    "twitter": "",
    "kaggle": "https://www.kaggle.com/muravaish"
  },
  "resumeUrl": ""
};

export interface StatHighlight {
  label: string;
  value: string;
}

export const heroStats: StatHighlight[] = [
  {
    "label": "ROC-AUC",
    "value": "84.51%"
  },
  {
    "label": "SQL Accuracy",
    "value": "27/30"
  },
  {
    "label": "Projects Shipped",
    "value": "6"
  },
  {
    "label": "Certifications",
    "value": "6"
  }
];

export interface SkillCategory {
  label: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    "label": "Languages",
    "skills": ["Python", "Java", "SQL", "R", "C"]
  },
  {
    "label": "Data Science & ML",
    "skills": ["scikit-learn", "pandas", "NumPy", "Feature Engineering", "EDA", "Data Cleaning"]
  },
  {
    "label": "Frameworks & Backend",
    "skills": ["Spring Boot", "FastAPI", "Java Servlets", "React", "React Native"]
  },
  {
    "label": "Databases",
    "skills": ["MongoDB Atlas", "NeonDB", "SQL Server (SSMS)", "PostgreSQL"]
  },
  {
    "label": "Tools & Platforms",
    "skills": ["Power BI", "Streamlit", "MLflow", "GitHub", "Google Colab", "VS Code", "IntelliJ IDEA"]
  },
  {
    "label": "Practices",
    "skills": ["REST API Design", "Agile / Scrum", "SDLC", "Team-Based Development"]
  }
];

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
  imageUrl?: string;
}

export const certifications: Certification[] = [
  {
    "id": "cert-one",
    "title": "AI/ML Engineer Stage 1 ",
    "issuer": "Centre for Open and Distance Education, SLIIT",
    "date": "2025",
    "url": "",
    "imageUrl": "/certifications/cert-one.png"
  },
  {
    "id": "9ldoanzjmgmshv0rhq",
    "title": "Lean Six Sigma White Belt",
    "issuer": "Alison",
    "date": "2026",
    "imageUrl": "/certifications/9ldoanzjmgmshv0rhq.png"
  },
  {
    "id": "c6tabhy17wjmshv2muu",
    "title": "Career Essentials in Data Analysis",
    "issuer": "Microsoft and LinkedIn",
    "date": "2026",
    "imageUrl": "/certifications/c6tabhy17wjmshv2muu.png"
  },
  {
    "id": "a0km6v1qas6mshv5iiu",
    "title": "Oracle Cloud Infrastructure Certified AI Foundations Associate",
    "issuer": "Oracle",
    "date": "2026",
    "imageUrl": "/certifications/a0km6v1qas6mshv5iiu.png"
  },
  {
    "id": "j1junmxnqadmshv78fw",
    "title": "Agentic AI Foundations Associate",
    "issuer": "Oracle",
    "date": "2026",
    "imageUrl": "/certifications/j1junmxnqadmshv78fw.png"
  },
  {
    "id": "best-research-paper-dtechbiz-2026",
    "title": "Best Research Paper Award — DTechBiz Research Symposium, Track 6",
    "issuer": "DTechBiz Research Symposium",
    "date": "2026"
  }
];

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

export const projects: Project[] = [
  {
    "id": "portfolio-command-center",
    "title": "This Portfolio + Command Center",
    "description": "A portfolio that's also a working productivity system: real CourseWeb deadline sync, a heuristic day-planner that balances coursework with job-prep, a GitHub + self-logged activity tracker, a skill-matched job board, and a BYO-key AI assistant.",
    "tags": [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Anthropic API"
    ],
    "repoUrl": "https://github.com/muravaish/Personal-portfolio",
    "highlight": false
  },
  {
    "id": "customer-churn-ai-platform",
    "title": "Customer Churn AI Intelligence Platform",
    "description": "An end-to-end machine learning project that predicts customer churn, assigns risk levels, recommends retention actions, and presents insights through a Streamlit app and Power BI dashboard. Connects data analysis, ML modeling, business logic, and decision support into one practical workflow.",
    "tags": [
      "Python",
      "scikit-learn",
      "SQL",
      "Streamlit",
      "Power BI",
      "MLflow"
    ],
    "repoUrl": "https://github.com/muravaish/customer-churn-ai-intelligence-platform"
  },
  {
    "id": "autonomous-data-analyst-agent",
    "title": "Autonomous Data Analyst + Decision Intelligence Agent",
    "description": "An agentic AI data analyst built with LangGraph that turns plain-English business questions into validated SQL, runs it against relational or uploaded CSV data, and returns grounded insights, auto-selected charts, and business recommendations — backed by an evaluation harness measuring SQL accuracy and faithfulness (27/30 combined execution accuracy, 30/30 faithful insights).",
    "tags": [
      "Python",
      "LangGraph",
      "Gemini",
      "Streamlit",
      "SQL",
      "Docker"
    ],
    "url": "https://autonomous-data-analyst-agent-8zsmr9ii5bsfxnshu37ykd.streamlit.app/",
    "repoUrl": "https://github.com/muravaish/autonomous-data-analyst-agent"
  },
  {
    "id": "vibe-lanka-travel-planner",
    "title": "Vibe Lanka — Psychometric Travel Planner",
    "description": "A full-stack AI travel platform that generates personalized Sri Lanka itineraries from OCEAN personality profiles: archetype prediction, destination matching, hotel clustering, guide ranking, and route optimization across 5 ML workflows. Won Best Research Paper at the DTechBiz Research Symposium, Track 6.",
    "tags": [
      "React",
      "Vite",
      "Flask",
      "PostgreSQL",
      "KNN",
      "K-Means",
      "Random Forest",
      "Thompson Sampling"
    ],
    "repoUrl": "https://github.com/muravaish/Vibe-Lanka"
  },
  {
    "id": "weather-trend-forecasting",
    "title": "Weather Trend Forecasting",
    "description": "Analyzed ~156,000 daily weather readings across 268 cities to uncover climate patterns and forecast global temperature. Compared SARIMA, Prophet, XGBoost, and a weighted ensemble (0.52°C RMSE, beating every individual model), with anomaly detection via Isolation Forest/STL decomposition and SHAP-based feature importance confirming latitude and UV index as the strongest predictors.",
    "tags": [
      "Python",
      "pandas",
      "scikit-learn",
      "Prophet",
      "XGBoost",
      "SHAP"
    ],
    "repoUrl": "https://github.com/muravaish/weather-trend-forecasting"
  },
  {
    "id": "5p7wm2do3pymshvkwj2",
    "title": "Weather Forecasting App",
    "description": "A full-stack weather app (React + Node/Express) with live location search, current + 5-day forecasts, an interactive map, and a full CRUD logbook with 5-format data export. Goes beyond the basics with multi-day natural hazard detection (flood/storm/heatwave/cold-wave), historical climate-context tagging, and a real Model Output Statistics bias-correction loop that improves future forecasts per location.",
    "tags": ["React", "Vite", "Node.js", "Express", "Leaflet", "Open-Meteo API"],
    "repoUrl": "https://github.com/muravaish/weather-app-fullstack"
  }
];

export interface ProfileData {
  profile: ProfileBasics;
  heroStats: StatHighlight[];
  skillCategories: SkillCategory[];
  certifications: Certification[];
  projects: Project[];
}
