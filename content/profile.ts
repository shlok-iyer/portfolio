/**
 * SINGLE SOURCE OF TRUTH.
 *
 * Every rendered page AND the chatbot's system prompt read from this file.
 * That is deliberate: it makes it structurally impossible for the bot to
 * contradict the site. Updating the site means editing this file.
 *
 * Keep it deterministic — no Date.now(), no random ordering. The serialised
 * form of this object is the cached prefix of every chat request, and any
 * per-request variation silently destroys the prompt cache.
 *
 * Fields marked TODO(shlok) still need real values.
 */

export type Link = { label: string; href: string };

export type Role = {
  sheetRef: string;
  title: string;
  org: string;
  period: string;
  tech: string[];
  bullets: string[];
  links?: Link[];
};

export type Project = {
  sheetRef: string;
  name: string;
  period?: string;
  tech: string[];
  summary: string;
  outcomes: { label: string; value: string }[];
  bullets: string[];
  links?: Link[];
};

export const profile = {
  /** Bumped by hand when content changes. Rendered in every title block. */
  lastRevised: "2026.08",

  name: { first: "Shlok", last: "Iyer", full: "Shlok Shivaram Iyer" },

  role: "Software developer",

  /** The A-0 tagline. Concrete, no adjectives doing the work. */
  tagline:
    "I build the layer between an idea and the thing that actually runs — FastAPI services, React Native apps, and LLM pipelines that hold up in production for 200+ teachers.",

  /**
   * TODO(shlok): drop your photo at public/shlok.jpg and set this to
   * "/shlok.jpg". Until then the sheet renders a registration-marked
   * placeholder in the same footprint, so the layout is already correct.
   */
  photo: null as string | null,

  location: "Bengaluru, India",
  email: "shlokiyer2004@gmail.com",
  phone: "+91 9606900460",

  links: {
    // TODO(shlok): confirm these resolve — taken from the resume's short forms.
    github: "https://github.com/shlok-iyer",
    linkedin: "https://linkedin.com/in/shlok-iyer",
    /** Drop the PDF at public/shlok-iyer-resume.pdf to enable the download. */
    resume: "/shlok-iyer-resume.pdf",
  },

  education: [
    {
      sheetRef: "E-1",
      institution: "B.M.S. College of Engineering",
      qualification: "B.E. Computer Science",
      period: "Nov 2022 – Aug 2026",
      result: "CGPA 8.8",
    },
    {
      sheetRef: "E-2",
      institution: "Narayana PU College, JP Nagar",
      qualification: "Senior Secondary (2nd PUC)",
      period: "Jun 2020 – Apr 2022",
      result: "93.16%",
    },
    {
      sheetRef: "E-3",
      institution: "Clarence Public School",
      qualification: "ICSE, Class X",
      period: "Jun 2008 – Mar 2020",
      result: "90%",
    },
  ],

  experience: [
    {
      sheetRef: "R-1",
      title: "Platform Development Intern",
      org: "Seedling Labs",
      period: "Jan 2026 – Jul 2026",
      tech: [
        "FastAPI",
        "React Native",
        "AWS Bedrock",
        "Gemini",
        "Alembic",
        "Docker",
        "Playwright",
        "TypeScript",
      ],
      bullets: [
        "Built Sprout, an AI-powered educational suite — lesson plan generator, auto-grader, question paper and worksheet generator, and a YouTube transcript analyzer — adopted by 200+ teachers with active users across two schools.",
        "Cut LLM token usage by 90% by keying system prompts to subject-based hash sets, so a request no longer had to ship the entire ~100K-token system prompt. That dropped both API cost and latency.",
        "Built a LaTeX rendering pipeline: changed the backend prompts to emit LaTeX for mathematical and chemical equations, and integrated KaTeX on the React frontend so STEM content renders correctly across lesson plans and worksheets.",
        "Built the YouTube Transcript Analyzer API on Gemini Flash. Worked out that a 30-minute video is roughly 20K tokens and fits inside Gemini's 200K context window, so I skipped RAG entirely — same accuracy, far less infrastructure.",
        "Designed teacher dashboards that needed the database schema to evolve, and used Alembic migrations to deploy those changes reliably across dev, staging and production without losing data integrity.",
        "Set up production engineering practice: API versioning for the web and mobile apps, Grafana monitoring, API documentation and testing through Hoppscotch, Docker containerisation, and disciplined git branch management.",
        "Delivered 8,000+ automated test cases in TypeScript with Playwright for an external client while still shipping on Sprout, using the Claude Playwright MCP to explore the site and generate coverage.",
      ],
    },
    {
      sheetRef: "R-2",
      title: "Project-based Learning Intern",
      org: "Sigma-Aldrich",
      period: "Jul 2025 – Aug 2025",
      tech: [
        "Gemini",
        "Llama 3",
        "Firebase",
        "Model fine-tuning",
        "Cloud Functions",
      ],
      bullets: [
        "Built Sahayak, a web app that helps teachers explain concepts using local analogies and cultural context so students understand them faster.",
        "Full-stack build in HTML, CSS, JavaScript, Python and Firebase, using Gemini's multimodal capabilities for content analysis and a fine-tuned Llama 3-8B Instruct on a curated Indian history and geography dataset to generate the local analogies.",
        "Deployed every backend function as a Firebase Cloud Function with regional language support — Hindi, Marathi, Kannada and Tamil — so rural teachers could teach in their own language.",
      ],
      links: [
        // TODO(shlok): add the Sahayak repo URL.
        { label: "GitHub", href: "https://github.com/shlok-iyer" },
      ],
    },
  ] satisfies Role[],

  projects: [
    {
      sheetRef: "P-1",
      name: "HireOn",
      period: "Feb 2026 – Mar 2026",
      tech: [
        "React Native",
        "FastAPI",
        "PostgreSQL",
        "Azure",
        "Vercel",
        "LLM automation",
      ],
      summary:
        "Capstone project: an AI-powered hiring platform that runs recruitment end to end — resume parsing, candidate ranking, interview workflow generation and automated communication.",
      outcomes: [
        { label: "Demoed to", value: "CEO + CTO" },
        { label: "Backend", value: "Azure" },
        { label: "Frontend", value: "Vercel" },
      ],
      bullets: [
        "Built the resume parsing and LLM scoring system: it extracts candidate skills from PDFs and ranks them against a company's stated baseline for the role and experience level, so filtering is data-driven rather than manual.",
        "Designed a Kanban-style pipeline that lets HR teams define their own hiring stages instead of being locked into a fixed funnel.",
        "Built an interviewer dashboard that generates role-specific question banks from the job requirements and the candidate's own resume strengths and gaps, then syncs assessments back to the HR pipeline in real time.",
        "Architected the backend on FastAPI and PostgreSQL, deployed across Azure and Vercel, for reliable concurrent request handling and a clean API surface to extend.",
      ],
      links: [
        // TODO(shlok): add the live demo URL and the repo.
        { label: "Live demo", href: "#" },
      ],
    },
    {
      sheetRef: "P-2",
      name: "Waste Detection & Classification",
      tech: ["YOLOv5s", "ConvNeXT", "Streamlit", "Data analysis"],
      summary:
        "A two-stage vision pipeline: YOLOv5s detects waste in public spaces, then a fine-grained ConvNeXT classifier sorts what it found into sub-categories.",
      outcomes: [
        { label: "YOLOv5s mAP", value: "81.7%" },
        { label: "YOLOv5s F1", value: "81.3%" },
        { label: "ConvNeXT accuracy", value: "90.43%" },
        { label: "ConvNeXT F1", value: "92.93%" },
      ],
      bullets: [
        "Detects 7 main waste classes and 28 sub-classes, trained on 30,000+ images.",
        "Used stratified sampling to keep the class distribution balanced, which is what made the accuracy hold up across the rarer sub-classes.",
        "Built a Streamlit interface for real-world testing and inference demos.",
      ],
      links: [
        // TODO(shlok): add the repo URL.
        { label: "GitHub", href: "https://github.com/shlok-iyer" },
      ],
    },
    {
      sheetRef: "P-3",
      name: "Sahayak",
      period: "Jul 2025 – Aug 2025",
      tech: ["Gemini", "Llama 3-8B", "Firebase", "Fine-tuning"],
      summary:
        "A teaching aid that explains concepts through local analogies and cultural context, in four regional languages, built during the Sigma-Aldrich internship.",
      outcomes: [
        { label: "Languages", value: "Hindi, Marathi, Kannada, Tamil" },
        { label: "Base model", value: "Llama 3-8B Instruct" },
      ],
      bullets: [
        "Fine-tuned Llama 3-8B Instruct on a curated Indian history and geography dataset to generate analogies that actually land locally.",
        "Ran every backend function as a Firebase Cloud Function, so it scaled without a server to maintain.",
      ],
      links: [{ label: "GitHub", href: "https://github.com/shlok-iyer" }],
    },
  ] satisfies Project[],

  skills: {
    Languages: ["Python", "TypeScript", "Java", "C/C++", "JavaScript"],
    Frameworks: ["FastAPI", "Flask", "React Native", "Expo"],
    Tools: ["Git", "GitHub", "Claude Code", "Playwright", "Docker"],
    Databases: ["PostgreSQL", "MySQL", "MongoDB", "Firebase"],
  } as Record<string, string[]>,

  certifications: ["Coursera Machine Learning Specialization"],

  /**
   * TODO(shlok): replace these with your real interests. They are on the site
   * AND in the chatbot's knowledge, so anything false here becomes something
   * the bot confidently tells a recruiter.
   */
  hobbies: [] as string[],

  /** What the bot should say when asked what you're after. */
  lookingFor:
    "A software developer role where I own real production surface area — backend services, AI/LLM systems, or full-stack product work.",
} as const;

export type Profile = typeof profile;
