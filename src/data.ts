export interface Project {
  name: string;
  description: string;
  tags: string[];
  repo: string;
  problem: string;
  approach: string;
  stack: string[];
  results: string;
  live?: string;
  api?: string;
}

const GH = "https://github.com/Sabin78910";

export const projects: Project[] = [
  { name: "Expense Tracker", description: "Android app to track spending by category.", tags: ["Android", "Kotlin", "Compose"], repo: `${GH}/expense-tracker-android`, problem: "Tracking everyday spending in spreadsheets is slow and easy to skip.", approach: "Single-activity Compose UI with Room storage; expenses grouped by category with monthly totals.", stack: ["Kotlin", "Jetpack Compose", "Room"], results: "Logging an expense takes a few taps and totals update instantly offline." },
  { name: "EMI Calculator", description: "Android loan EMI calculator with amortization schedule.", tags: ["Android", "Kotlin", "Finance"], repo: `${GH}/emi-calculator-android`, problem: "Borrowers struggle to see how much interest a loan really costs.", approach: "Pure Kotlin amortization logic with unit tests, rendered as a month-by-month schedule.", stack: ["Kotlin", "Jetpack Compose"], results: "Shows total interest and a full repayment schedule for any amount, rate and term." },
  { name: "Notes", description: "Android notes with search and pinning.", tags: ["Android", "Kotlin"], repo: `${GH}/notes-android`, problem: "Quick notes get lost without fast search and a way to keep key ones on top.", approach: "Room full-text style search and a pinned flag that sorts important notes first.", stack: ["Kotlin", "Room"], results: "Find any note while typing; pinned notes stay at the top." },
  { name: "Todo", description: "Offline-first todo list in the browser.", tags: ["Web", "React", "TypeScript"], repo: `${GH}/todo-web`, problem: "Todo lists should work without a connection or an account.", approach: "Offline-first React app persisting state to localStorage with typed reducers.", stack: ["React", "TypeScript", "localStorage"], results: "Fully usable offline; data survives reloads.", live: `https://sabin78910.github.io/todo-web/` },
  { name: "Weather Dashboard", description: "Live forecast for any city using Open-Meteo.", tags: ["Web", "React", "API"], repo: `${GH}/weather-dashboard-web`, problem: "Weather sites are cluttered and often require API keys.", approach: "Typed client for the keyless Open-Meteo API with geocoding and a compact forecast view.", stack: ["React", "TypeScript", "Open-Meteo"], results: "Live forecast for any city with no API key or backend.", live: `https://sabin78910.github.io/weather-dashboard-web/` },
  { name: "Loan Calculator", description: "Web EMI calculator with schedule.", tags: ["Web", "React", "Finance"], repo: `${GH}/loan-calculator-web`, problem: "People want to compare loan options without installing an app.", approach: "Shared amortization logic ported to TypeScript with tests, shown as a schedule table.", stack: ["React", "TypeScript"], results: "Instant EMI and schedule in the browser.", live: `https://sabin78910.github.io/loan-calculator-web/` },
  { name: "Inventory API", description: "REST API for products and stock.", tags: ["Backend", "Node", "TypeScript"], repo: `${GH}/inventory-api-node`, problem: "Small shops need a simple way to manage products and stock levels.", approach: "REST endpoints for products and stock adjustments with validated input.", stack: ["Node", "TypeScript", "REST"], results: "Consistent CRUD and stock endpoints covered by tests.", api: "https://inventory-api-tagg.onrender.com" },
  { name: "Bookstore API", description: "FastAPI service for books.", tags: ["Backend", "Python", "FastAPI"], repo: `${GH}/bookstore-api-python`, problem: "A clean reference service for book data with automatic docs.", approach: "FastAPI with Pydantic models and generated OpenAPI documentation.", stack: ["Python", "FastAPI", "Pydantic"], results: "Typed endpoints with interactive API docs out of the box.", api: "https://bookstore-api-lhpl.onrender.com" },
  { name: "House Price ML", description: "Regression model predicting house prices.", tags: ["ML", "Python", "scikit-learn"], repo: `${GH}/house-price-ml`, problem: "Estimating house prices by hand is inconsistent.", approach: "Feature preparation with pandas and a scikit-learn regression model evaluated on held-out data.", stack: ["Python", "scikit-learn", "pandas"], results: "A reproducible regression baseline for price prediction." },
];

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
