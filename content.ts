// Single source of truth for everything the site says about Lakshya.
// Every fact here is taken from the résumé (public/Lakshya-Gupta-Resume.pdf). Add new facts only once verified.

export type LinkItem = { label: string; href: string };
export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  kind: "Internship" | "Open source";
  href?: string;
  stack: string[];
  points: string[];
};
export type ProjectCategory = "AI/ML" | "Full Stack" | "Backend" | "Game" | "Other";
export type ProjectItem = {
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  featured?: boolean;
  stack: string[];
  href?: string;
  demo?: string;
  capabilities: string[];
  /** Verified implementation details. Optional case-study fields render only when present. */
  highlights: string[];
  problem?: string;
  architecture?: string;
  challenges?: string;
  outcome?: string;
};

export const content = {
  person: {
    name: "Lakshya Gupta",
    shortName: "Lakshya",
    role: "Software Developer",
    positioning: "Backend-leaning full-stack developer at NIT Jalandhar, looking for SDE internship opportunities.",
    status: "Open to SDE internships",
    // Rotating hero line. Each item restates something the résumé shows he has built.
    specialties: ["backend services", "full-stack web apps", "Python data pipelines", "voice interfaces"],
    summary: "Undergraduate at NIT Jalandhar with hands-on experience in backend development, full-stack web applications and Python-based systems. Strong foundation in data structures, algorithms and object-oriented programming.",
    email: "Lakshyagupta3009@gmail.com",
    location: "India",
    portrait: "/lakshya-gupta.jpg",
    resume: "/Lakshya-Gupta-Resume.pdf",
    github: "Lak5hya30",
  },
  links: [
    { label: "GitHub", href: "https://github.com/Lak5hya30" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/lakshya-gupta-a58621197/" },
    { label: "LeetCode", href: "https://leetcode.com/u/Lak5hya30/" },
  ] satisfies LinkItem[],
  education: {
    school: "Dr. B R Ambedkar National Institute of Technology, Jalandhar",
    degree: "Bachelor of Engineering in Mechanical Engineering",
    period: "August 2023 — Present",
  },
  achievement: { value: 300, suffix: "+", label: "DSA problems solved on LeetCode and GFG" },
  achievements: [
    { value: "300+", label: "DSA problems solved on LeetCode and GeeksforGeeks", href: "https://leetcode.com/u/Lak5hya30/" },
    { value: "Open source", label: "Pull requests submitted to Dynamo, an AI-driven project by Handshake AI", href: "https://github.com/handshake-project-dynamo/dynamo-523e168-debugging-and-repair" },
  ],
  experience: [
    {
      role: "Software Developer Intern",
      company: "Techlomedia",
      period: "June 2026 — July 2026",
      kind: "Internship",
      stack: ["Python", "Sentiment analysis", "Text summarization"],
      points: [
        "Collected and preprocessed large-scale e-commerce product review data in Python.",
        "Built sentiment analysis pipelines to classify customer feedback.",
        "Helped develop review summarization logic for unstructured data.",
        "Worked with senior engineers to integrate analytical outputs into existing systems.",
      ],
    },
    {
      role: "Open-source contributor",
      company: "Dynamo, Handshake AI",
      period: "Open-source work",
      kind: "Open source",
      href: "https://github.com/handshake-project-dynamo/dynamo-523e168-debugging-and-repair",
      stack: ["Python", "Docker", "Linux", "Git"],
      points: [
        "Contributed to an AI-driven project using Python, Docker and Linux.",
        "Submitted pull requests and improved project components.",
        "Worked with version control, debugging and containerized workflows.",
      ],
    },
  ] satisfies ExperienceItem[],
  // Only work worth showcasing. Facts come from each repository's own README (checked Nov 2026).
  projects: [
    {
      slug: "adaptive-fraud-defense-arena",
      title: "AI Defense Lab for Adaptive Payment Fraud",
      description: "A closed-loop red team / blue team lab that discovers, simulates and defends against emerging payment fraud. Built for the Mastercard Innovation Challenge 2026.",
      category: "AI/ML",
      featured: true,
      stack: ["Python", "Gradient boosting", "Anomaly detection", "Streamlit", "pytest", "Docker"],
      href: "https://github.com/Lak5hya30/adaptive-fraud-defense-arena",
      capabilities: ["Discover", "Simulate", "Attack", "Detect", "Adapt"],
      highlights: [
        "Five-stage loop: catalogue GenAI-enabled fraud, simulate it as synthetic transactions, attack the detector, detect, then adapt.",
        "Detection fuses gradient boosting with an anomaly detector over authorization-time features only.",
        "Missed attacks feed a replay buffer; the defense retrains and a governance step decides whether the new model may ship.",
        "Every number is regenerated from a single seed, and the README and app are generated from the same artifacts.",
      ],
      problem: "Supervised fraud models learn from labelled history, which takes weeks to arrive, while generative AI makes new attacks cheap. The question this lab measures is how a defense behaves the first time it meets something new, and how fast it learns.",
      architecture: "Packages under src/ map to the stages: identify (threat catalogue), generate (constrained simulator), loop (red team and replay), defend (detector and governance). A Streamlit app presents the results, with a demo mode that needs no API key or network.",
      outcome: "On synthetic data, a fraud family removed from training was caught 16% of the time; after the lab generated it and replayed it into training, 86% (n = 44). The README is explicit that nothing has been validated on real payment data.",
    },
    {
      slug: "bobs-world",
      title: "BOB's World",
      description: "A top-down, tile-based zombie shooter built in Python with Pygame: scrolling Tiled maps, two weapons, zombie AI, pickups and a night mode.",
      category: "Game",
      stack: ["Python", "Pygame", "pytmx", "Tiled"],
      href: "https://github.com/Lak5hya30/tile-based-game",
      capabilities: ["Tiled maps", "Pistol & shotgun", "Zombie AI", "Pickups", "Night / fog", "Sound & music"],
      // Facts read from the repository's source (settings.py, tilemap.py, TILEMAIN.py); its README is only a title.
      highlights: [
        "Levels are designed in Tiled and loaded with pytmx; a camera follows the player and clamps scrolling to the map edges.",
        "Two data-driven weapons: a pistol and a 12-pellet shotgun, each with its own rate, spread, kickback and damage.",
        "Zombies detect the player within 400px, avoid crowding each other and move at varied speeds; collisions use separate hit boxes.",
        "Health and shotgun pickups, a health bar and zombie counter, pause, a night/fog effect, background music and sound effects.",
        "Frame-rate independent movement and rotation using delta time at 60 FPS.",
      ],
    },
    {
      slug: "ai-virtual-assistant",
      title: "AI Virtual Assistant",
      description: "A voice-controlled personal assistant for hands-free PC operation, built with accessibility in mind.",
      category: "AI/ML",
      stack: ["Python", "Speech Recognition", "gTTS", "PyAudio"],
      href: "https://github.com/Lak5hya30/AI-assistant",
      capabilities: ["Web search", "App launching", "System commands", "Music playback"],
      highlights: [
        "Integrated Speech Recognition, Google Text-to-Speech and PyAudio for real-time voice interaction.",
        "Runs common PC tasks hands-free: web search, launching apps, system commands and music playback.",
        "Designed to be useful for visually impaired users.",
      ],
    },
  ] satisfies ProjectItem[],
  // Repos left out of the GitHub stats (profile config, old copies of this site).
  hiddenRepos: ["Lak5hya30", "Lakshya-portfolio", "Portfolio"],
  skills: [
    { label: "Languages", values: ["C++", "Python", "JavaScript", "TypeScript"] },
    { label: "Web", values: ["React.js", "Next.js", "HTML", "CSS"] },
    { label: "Backend & databases", values: ["Node.js", "MongoDB", "MySQL", "GraphQL"] },
    // Docker and Linux come from the Dynamo open-source work on the résumé.
    { label: "Tooling", values: ["Git", "Docker", "Linux"] },
    { label: "Fundamentals", values: ["Data Structures & Algorithms", "OOP"] },
  ],
} as const;

export type Content = typeof content;
