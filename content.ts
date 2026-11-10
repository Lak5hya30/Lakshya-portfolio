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
  role?: string;
  timeframe?: string;
  highlights: string[];
  problem?: string;
  architecture?: string;
  /** Verified component map for the architecture diagram: what each part does and where it lives. */
  components?: { name: string; detail: string; where: string }[];
  /** Key engineering decisions and the trade-offs behind them. */
  decisions?: string[];
  testing?: string;
  limitations?: string[];
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
    intro: "I like engineering that is explainable: interfaces that make sense, backend systems with clear boundaries, and models whose behavior can be evaluated rather than guessed.",
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
  // Credibility strip under the hero. Every item is on the résumé.
  evidence: [
    { label: "Education", value: "NIT Jalandhar" },
    { label: "Internship", value: "Software Developer Intern · Techlomedia · Jun–Jul 2026" },
    { label: "Open source", value: "Contributor · Dynamo, Handshake AI" },
    { label: "Problem solving", value: "300+ DSA problems" },
    { label: "Location", value: "India · open to SDE internships" },
  ],
  achievements: [
    { value: "300+", label: "DSA problems solved on LeetCode and GeeksforGeeks", href: "https://leetcode.com/u/Lak5hya30/" },
    { value: "Open source", label: "Pull requests submitted to Dynamo, an AI-driven project by Handshake AI", href: "https://github.com/handshake-project-dynamo" },
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
      href: "https://github.com/handshake-project-dynamo",
      stack: ["Python", "Docker", "Linux", "Git"],
      points: [
        "Contributed to an AI-driven project using Python, Docker and Linux.",
        "Submitted pull requests and improved project components.",
        "Worked with version control, debugging and containerized workflows.",
      ],
    },
  ] satisfies ExperienceItem[],
  // TODO(owner): add verified role/contribution (solo or team?), timeframe, screenshots and any measured results per
  // project. Case-study pages show these fields only when present; nothing is padded with placeholders.
  // Only work worth showcasing. Facts come from each repository's own README (checked Nov 2026).
  projects: [
    {
      slug: "ai-defense-lab",
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
      components: [
        { name: "Discover", detail: "Catalogue of GenAI-enabled payment-fraud patterns, each marked by whether the simulator reproduces it", where: "src/identify" },
        { name: "Simulate", detail: "Constrained engine that turns an attack specification into transactions inside a synthetic portfolio", where: "src/generate" },
        { name: "Attack", detail: "Red team measures which signal the defense relies on and aims the next generation at removing it", where: "src/loop" },
        { name: "Detect", detail: "Gradient boosting fused with an anomaly detector over authorization-time features", where: "src/defend" },
        { name: "Adapt", detail: "Escaped attacks go to a replay buffer; the defense retrains and governance decides if it ships", where: "src/loop · src/defend" },
      ],
      decisions: [
        "The language model never writes transactions. It writes an attack specification that is validated against payment-domain constraints (impossible combinations are clamped or refused) before a seeded simulator generates any rows.",
        "Demo mode uses committed, deterministic specifications so the app runs with no API key, network or training, and every figure reproduces from one seed.",
        "Detectors are compared at a matched false-positive budget (≤2%) rather than at whatever operating point each lands on, so recall differences are meaningful.",
      ],
      testing: "Every stage is seeded from one global seed, so a single pipeline command regenerates every artifact. The README, figures and walkthrough are generated from those artifacts rather than typed by hand, and an artifact-consistency test fails the build if any two documents disagree on a number. A full pytest suite covers the pipeline.",
      limitations: [
        "Synthetic data only; a real deployment would need a labelled backtest on issuer data.",
        "Some fraud (first-party abuse, victim-authorized scams) is not observable at authorization time and is reported with low recall.",
        "No shadow rollout, drift monitoring or analyst feedback loop is simulated, and the work has not been reviewed by Mastercard.",
      ],
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
      architecture: "A classic Pygame game loop (events → update → draw at 60 FPS) with configuration, map handling and sprites split into separate modules. Levels are authored in the Tiled editor rather than hard-coded.",
      components: [
        { name: "Game loop", detail: "Loads assets and sounds, spawns the level, then runs events → update → draw; handles pause and game over", where: "TILEMAIN.py" },
        { name: "Settings", detail: "Screen, tile size and data-driven weapon, player and zombie parameters", where: "settings.py" },
        { name: "Map & camera", detail: "Renders Tiled (.tmx) layers via pytmx; camera follows the player and clamps to the map", where: "tilemap.py" },
        { name: "Sprites", detail: "Player, zombies, bullets and pickups with separate collision hit boxes", where: "sprites.py" },
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
    { label: "Frontend", values: ["React.js", "Next.js", "HTML", "CSS"] },
    { label: "Backend & data", values: ["Node.js", "MongoDB", "MySQL", "GraphQL"] },
    // Docker and Linux come from the Dynamo open-source work on the résumé.
    { label: "Tooling", values: ["Git", "Docker", "Linux"] },
    { label: "Foundations", values: ["Data Structures & Algorithms", "OOP"] },
  ],
} as const;

export type Content = typeof content;
