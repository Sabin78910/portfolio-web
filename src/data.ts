export interface Project {
  name: string;
  /** URL-safe id used for case-study deep links (#work/<slug>). */
  slug: string;
  description: string;
  tags: string[];
  repo: string;
  problem: string;
  research: string;
  approach: string;
  stack: string[];
  results: string;
  /** Declared automated test cases in the repo (counted 2026-10-11). */
  tests: number;
  /** Brand colour used for the card glow and case-study accents. */
  accent: string;
  live?: string;
  api?: string;
  /** Full health URL when it is not `${api}/health`. */
  health?: string;
  /** false when the repo has no ci.yml (status falls back to a neutral dot). */
  ci?: boolean;
  featured?: boolean;
  /** Bento footprint for featured cards. */
  size?: "xl" | "tall" | "wide";
  image?: { kind: "desktop" | "phone"; src: string; width: number; height: number; alt: string };
}

const GH = "https://github.com/Sabin78910";
const PAGES = "https://sabin78910.github.io";
const phone = (src: string, alt: string) => ({ kind: "phone" as const, src: `./shots/${src}`, width: 450, height: 974, alt });
const desktop = (src: string, alt: string) => ({ kind: "desktop" as const, src: `./shots/${src}`, width: 960, height: 600, alt });

export const projects: Project[] = [
  { name: "Ludo Live", slug: "ludo-live", description: "Online multiplayer Ludo with provably fair dice, smart bots and no ads in matches.", tags: ["Game", "Web", "Realtime"], repo: `${GH}/ludo-live`, live: `${PAGES}/ludo-live/`, featured: true, size: "xl", accent: "#EF3B4F", tests: 140,
    problem: "Ludo players often suspect the dice are rigged, and most Ludo apps interrupt matches with ads.",
    research: "Store reviews of popular Ludo apps keep returning to two complaints: dice that feel unfair and ads mid-game. Commit-reveal schemes from provably fair games answer the first one with maths instead of promises.",
    approach: "Commit-reveal dice: the server publishes SHA-256(seed) before the first roll, every roll is an HMAC of the seed, and a Verify screen recomputes every roll in the browser. Online rooms run on Cloudflare Durable Objects with server-authoritative moves, rejoin tokens and bot takeover.",
    stack: ["React", "TypeScript", "Cloudflare Workers", "Durable Objects", "Capacitor"],
    results: "Anyone can check every roll of a finished game. Rooms work with a 6-character code or a WhatsApp invite, on the web and Android.",
    image: phone("ludo-live.webp", "Ludo Live game board with four players and a provably fair dice hash") },
  { name: "Prism Pop", slug: "prism-pop", description: "Original match-3 gem puzzle with power-gem combos. No lives, no waiting.", tags: ["Game", "Web", "Canvas"], repo: `${GH}/prism-pop-game`, live: `${PAGES}/prism-pop-game/`, featured: true, size: "tall", accent: "#A855F7", tests: 66,
    problem: "Match-3 games are fun to play but often gate play behind lives, energy timers and forced ads.",
    research: "Players' reviews of popular match-3 games most often complain about lives and timers. Colour-blind players also struggle when gems differ only by colour.",
    approach: "A canvas match-3 engine with seeded levels, cascades, power gems and combos, plus a daily challenge with a streak. Each gem colour has its own shape, and reduced-motion mode is built in.",
    stack: ["TypeScript", "Canvas", "Vite", "Capacitor"],
    results: "Unlimited levels with no lives or timers, playable offline as a PWA and on Android, in English and Nepali.",
    image: phone("prism-pop.webp", "Prism Pop match-3 board with coloured gems and boosters") },
  { name: "NEPSE Lens", slug: "nepse-lens", description: "Nepal Stock Exchange board with broker accumulation, alerts and portfolio P/L.", tags: ["Web", "Finance", "Data"], repo: `${GH}/nepse-lens`, live: `${PAGES}/nepse-lens/`, featured: true, size: "wide", accent: "#22C55E", tests: 86,
    problem: "Nepali investors check NEPSE on slow, ad-heavy sites, and broker activity is hard to follow.",
    research: "NEPSE has no official public API. The floorsheet with buyer and seller broker numbers is public for the latest day only, so history has to be collected daily.",
    approach: "Python collectors in GitHub Actions snapshot the market every 10 minutes during trading hours and store end-of-day data in git branches. A mobile-first PWA reads it, with a Cloudflare Worker cache in front.",
    stack: ["React", "TypeScript", "Python", "GitHub Actions", "Cloudflare Workers"],
    results: "A fast market board, sector heatmap, broker accumulation tracker, watchlist alerts and fee-aware portfolio P/L, clearly labelled as delayed and unofficial.",
    image: desktop("nepse-lens.webp", "NEPSE Lens market board with the NEPSE index chart, top gainers and a sector heatmap") },
  { name: "Khabar Pulse", slug: "khabar-pulse", description: "Nepal and world news from 37 outlets, with the same story merged into one card.", tags: ["Web", "News", "PWA"], repo: `${GH}/khabar-pulse`, live: `${PAGES}/khabar-pulse/`, featured: true, size: "tall", accent: "#E11D48", tests: 78,
    problem: "Following Nepali news means opening many sites that repeat the same story.",
    research: "Readers want one feed but trust named sources. Showing only the headline, a short snippet and a link keeps publishers in control of their articles.",
    approach: "A pure TypeScript pipeline fetches 37 RSS feeds, cleans, deduplicates and clusters stories (Devanagari-aware), then ranks and categorises them. A Worker serves it every 10 minutes, with a static news.json fallback.",
    stack: ["React", "TypeScript", "Cloudflare Workers", "RSS", "Capacitor"],
    results: "One clean feed where each story says how many outlets covered it, with Bikram Sambat dates, bookmarks and offline reading.",
    image: phone("khabar-pulse.webp", "Khabar Pulse news feed in Nepali with story cards that list their sources") },
  { name: "Block Drop", slug: "block-drop", description: "Polished block puzzle game built with Unity.", tags: ["Game", "Unity", "C#"], repo: `${GH}/blockdrop-puzzle-unity`, featured: true, size: "tall", accent: "#F59E0B", tests: 42, ci: false,
    problem: "Casual puzzle games often feel cluttered with ads and weak feedback.",
    research: "Top block puzzles win on feel: instant placement feedback, satisfying clears and a reason to come back, such as a daily challenge.",
    approach: "Unity game with clean grid logic, satisfying drop and clear effects, and a store-ready presentation.",
    stack: ["Unity", "C#"],
    results: "A complete, store-ready puzzle game with a seeded daily challenge.",
    image: { kind: "phone", src: "./shots/blockdrop-gameplay.jpg", width: 405, height: 720, alt: "Block Drop gameplay screenshot" } },
  { name: "Sync API", slug: "sync-api", description: "End-to-end encrypted sync between devices for the web apps, with no accounts.", tags: ["Backend", "Cloudflare", "Security"], repo: `${GH}/sync-api`, api: "https://sync-api.sabin-apps.workers.dev", health: "https://sync-api.sabin-apps.workers.dev/v1/health", accent: "#38BDF8", tests: 20,
    problem: "People want their todos and saved calculations on both phone and laptop without creating yet another account.",
    research: "A sync code that carries its own secret removes accounts entirely, and client-side encryption means the server never needs to be trusted with data.",
    approach: "HKDF turns the code's secret into an AES-256-GCM key and an auth token. A Cloudflare Worker with one SQLite Durable Object per space stores only ciphertext and resolves conflicts with versioned writes.",
    stack: ["TypeScript", "Cloudflare Workers", "Durable Objects", "Web Crypto"],
    results: "Devices sync with a single code; the server cannot read anyone's data.",
  },
  { name: "Todo", slug: "todo", description: "Offline-first todo list in the browser.", tags: ["Web", "React", "TypeScript"], repo: `${GH}/todo-web`, live: `${PAGES}/todo-web/`, accent: "#8B5CF6", tests: 128,
    problem: "Todo lists should work without a connection or an account.",
    research: "Habit research favours small daily goals and visible streaks over long backlogs.",
    approach: "Offline-first React app persisting state to localStorage with typed reducers.",
    stack: ["React", "TypeScript", "localStorage"],
    results: "Fully usable offline; data survives reloads.",
    image: desktop("todo.webp", "Todo web app screenshot with a daily goal ring and streaks") },
  { name: "Weather Dashboard", slug: "weather", description: "Live forecast for any city using Open-Meteo.", tags: ["Web", "React", "API"], repo: `${GH}/weather-dashboard-web`, live: `${PAGES}/weather-dashboard-web/`, accent: "#0EA5E9", tests: 111,
    problem: "Weather sites are cluttered and often require API keys.",
    research: "Most people open a weather app for one answer: what it feels like outside now and later today.",
    approach: "Typed client for the keyless Open-Meteo API with geocoding and a compact forecast view.",
    stack: ["React", "TypeScript", "Open-Meteo"],
    results: "Live forecast for any city with no API key or backend.",
    image: desktop("weather-dashboard.webp", "Weather Dashboard web app screenshot showing Kathmandu at 14°C") },
  { name: "Loan Calculator", slug: "loan-calculator", description: "Web EMI calculator with schedule.", tags: ["Web", "React", "Finance"], repo: `${GH}/loan-calculator-web`, live: `${PAGES}/loan-calculator-web/`, accent: "#10B981", tests: 139,
    problem: "People want to compare loan options without installing an app.",
    research: "Borrowers compare monthly payment first and total interest second, so both need to be visible at once.",
    approach: "Shared amortization logic ported to TypeScript with tests, shown as a schedule table.",
    stack: ["React", "TypeScript"],
    results: "Instant EMI and schedule in the browser.",
    image: desktop("loan-calculator.webp", "Loan Calculator web app screenshot with monthly EMI and a principal and interest chart") },
  { name: "Expense Tracker", slug: "expense-tracker", description: "Android app to track spending by category.", tags: ["Android", "Kotlin", "Compose"], repo: `${GH}/expense-tracker-android`, accent: "#16A34A", tests: 192,
    problem: "Tracking everyday spending in spreadsheets is slow and easy to skip.",
    research: "Logging has to take seconds, or people stop doing it within a week.",
    approach: "Single-activity Compose UI with Room storage; expenses grouped by category with monthly totals.",
    stack: ["Kotlin", "Jetpack Compose", "Room"],
    results: "Logging an expense takes a few taps and totals update instantly offline.",
    image: { kind: "phone", src: "./shots/expense-android.jpg", width: 324, height: 720, alt: "Expense Tracker Android app screenshot" } },
  { name: "EMI Calculator", slug: "emi-calculator", description: "Android loan EMI calculator with amortization schedule.", tags: ["Android", "Kotlin", "Finance"], repo: `${GH}/emi-calculator-android`, accent: "#14B8A6", tests: 164,
    problem: "Borrowers struggle to see how much interest a loan really costs.",
    research: "Showing the total interest next to the monthly payment changes how people compare loans.",
    approach: "Pure Kotlin amortization logic with unit tests, rendered as a month-by-month schedule.",
    stack: ["Kotlin", "Jetpack Compose"],
    results: "Shows total interest and a full repayment schedule for any amount, rate and term.",
    image: { kind: "phone", src: "./shots/emi-android.jpg", width: 324, height: 720, alt: "EMI Calculator Android app screenshot" } },
  { name: "Notes", slug: "notes", description: "Android notes with search and pinning.", tags: ["Android", "Kotlin"], repo: `${GH}/notes-android`, accent: "#EAB308", tests: 160,
    problem: "Quick notes get lost without fast search and a way to keep key ones on top.",
    research: "People re-find notes by a word they remember, so search must work while typing.",
    approach: "Room full-text style search and a pinned flag that sorts important notes first.",
    stack: ["Kotlin", "Room"],
    results: "Find any note while typing; pinned notes stay at the top." },
  { name: "Inventory API", slug: "inventory-api", description: "REST API for products and stock.", tags: ["Backend", "Node", "TypeScript"], repo: `${GH}/inventory-api-node`, api: "https://inventory-api-tagg.onrender.com", accent: "#F97316", tests: 95,
    problem: "Small shops need a simple way to manage products and stock levels.",
    research: "Shop owners mostly need two things: what is in stock and what changed today.",
    approach: "REST endpoints for products and stock adjustments with validated input.",
    stack: ["Node", "TypeScript", "REST"],
    results: "Consistent CRUD and stock endpoints covered by tests." },
  { name: "Bookstore API", slug: "bookstore-api", description: "FastAPI service for books.", tags: ["Backend", "Python", "FastAPI"], repo: `${GH}/bookstore-api-python`, api: "https://bookstore-api-lhpl.onrender.com", size: "wide", accent: "#EF4444", tests: 84,
    problem: "A clean reference service for book data with automatic docs.",
    research: "Developers judge an API by its docs first, so interactive OpenAPI docs come out of the box.",
    approach: "FastAPI with Pydantic models and generated OpenAPI documentation.",
    stack: ["Python", "FastAPI", "Pydantic"],
    results: "Typed endpoints with interactive API docs out of the box." },
  { name: "House Price ML", slug: "house-price-ml", description: "Regression model predicting house prices.", tags: ["ML", "Python", "scikit-learn"], repo: `${GH}/house-price-ml`, size: "wide", accent: "#EC4899", tests: 55,
    problem: "Estimating house prices by hand is inconsistent.",
    research: "Gradient boosting is a strong baseline for tabular data, and synthetic test data keeps CI fast and offline.",
    approach: "Feature preparation with pandas and a scikit-learn regression model evaluated on held-out data.",
    stack: ["Python", "scikit-learn", "pandas"],
    results: "A reproducible regression baseline for price prediction." },
];

/** Category (first tag) drives the tile icon and gradient. */
export const categoryIcons: Record<string, string> = {
  Android: "📱",
  Web: "🌐",
  Backend: "⚙️",
  ML: "🧠",
  Game: "🎮",
};

export function categoryOf(p: Project): string {
  return p.tags[0];
}

export function allTags(list: Project[]): string[] {
  return [...new Set(list.flatMap((p) => p.tags))].sort();
}

export function filterByTag(list: Project[], tag: string | null): Project[] {
  return tag ? list.filter((p) => p.tags.includes(tag)) : list;
}

export function filterByQuery(list: Project[], query: string): Project[] {
  const q = query.trim().toLowerCase();
  return q
    ? list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    : list;
}

export function findBySlug(list: Project[], slug: string): Project | undefined {
  return list.find((p) => p.slug === slug);
}

/** Repo name from its GitHub URL, e.g. "ludo-live". */
export function repoName(p: Project): string {
  return p.repo.split("/").pop() ?? "";
}

export const contact = {
  email: "sabinkhanal13@gmail.com",
  github: "https://github.com/Sabin78910",
};

export type SkillGroup = { area: string; items: string[] };

export const skills: SkillGroup[] = [
  { area: "Android", items: ["Kotlin", "Jetpack Compose", "Room"] },
  { area: "Web", items: ["React", "TypeScript", "Vite"] },
  { area: "Backend", items: ["Node", "FastAPI", "REST APIs"] },
  { area: "ML", items: ["Python", "scikit-learn", "pandas"] },
];

export function computeStats(list: Project[]) {
  return {
    apps: list.length,
    apis: list.filter((p) => p.api).length,
    tested: list.filter((p) => p.tests > 0).length,
    tests: list.reduce((n, p) => n + p.tests, 0),
  };
}

export function techStack(list: Project[]): string[] {
  return [...new Set(list.flatMap((p) => p.stack))].sort();
}
