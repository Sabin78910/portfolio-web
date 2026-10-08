export interface Project {
  name: string;
  description: string;
  tags: string[];
  repo: string;
}

const GH = "https://github.com/Sabin78910";

export const projects: Project[] = [
  { name: "Expense Tracker", description: "Android app to track spending by category.", tags: ["Android", "Kotlin", "Compose"], repo: `${GH}/expense-tracker-android` },
  { name: "EMI Calculator", description: "Android loan EMI calculator with amortization schedule.", tags: ["Android", "Kotlin", "Finance"], repo: `${GH}/emi-calculator-android` },
  { name: "Notes", description: "Android notes with search and pinning.", tags: ["Android", "Kotlin"], repo: `${GH}/notes-android` },
  { name: "Todo", description: "Offline-first todo list in the browser.", tags: ["Web", "React", "TypeScript"], repo: `${GH}/todo-web` },
  { name: "Weather Dashboard", description: "Live forecast for any city using Open-Meteo.", tags: ["Web", "React", "API"], repo: `${GH}/weather-dashboard-web` },
  { name: "Loan Calculator", description: "Web EMI calculator with schedule.", tags: ["Web", "React", "Finance"], repo: `${GH}/loan-calculator-web` },
  { name: "Inventory API", description: "REST API for products and stock.", tags: ["Backend", "Node", "TypeScript"], repo: `${GH}/inventory-api-node` },
  { name: "Bookstore API", description: "FastAPI service for books.", tags: ["Backend", "Python", "FastAPI"], repo: `${GH}/bookstore-api-python` },
  { name: "House Price ML", description: "Regression model predicting house prices.", tags: ["ML", "Python", "scikit-learn"], repo: `${GH}/house-price-ml` },
];

export function allTags(list: Project[]): string[] {
  return [...new Set(list.flatMap((p) => p.tags))].sort();
}

export function filterByTag(list: Project[], tag: string | null): Project[] {
  return tag ? list.filter((p) => p.tags.includes(tag)) : list;
}
