import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { allTags, contact, filterByQuery, filterByTag, projects, skills } from "./data";

test("filters projects by tag", () => {
  expect(filterByTag(projects, "Android")).toHaveLength(3);
  expect(filterByTag(projects, null)).toHaveLength(projects.length);
  expect(allTags(projects)).toContain("Python");
});

test("clicking a tag filters the list", async () => {
  render(<App />);
  expect(screen.getAllByRole("article")).toHaveLength(projects.length);
  await userEvent.click(screen.getByRole("button", { name: "ML" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
});

test("contact section renders email and GitHub links", () => {
  render(<App />);
  const section = within(screen.getByRole("region", { name: "Contact" }));
  expect(section.getByRole("link", { name: "Email" })).toHaveAttribute("href", `mailto:${contact.email}`);
  expect(section.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", contact.github);
});

test("filterByQuery matches name or description case-insensitively", () => {
  expect(filterByQuery(projects, "")).toHaveLength(projects.length);
  expect(filterByQuery(projects, "  ")).toHaveLength(projects.length);
  expect(filterByQuery(projects, "weather").map((p) => p.name)).toEqual(["Weather Dashboard"]);
  expect(filterByQuery(projects, "FASTAPI service")).toHaveLength(1);
  expect(filterByQuery(projects, "zzz")).toHaveLength(0);
});

test("search box filters projects and combines with tag filter", async () => {
  render(<App />);
  const box = screen.getByRole("searchbox", { name: /search projects/i });
  await userEvent.type(box, "calculator");
  expect(screen.getAllByRole("article")).toHaveLength(2);
  await userEvent.click(screen.getByRole("button", { name: "Web" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  await userEvent.clear(box);
  await userEvent.type(box, "zzz");
  expect(screen.queryAllByRole("article")).toHaveLength(0);
});

describe("theme toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  test("toggle changes data-theme on <html> and persists it", async () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /theme/i });
    await userEvent.click(btn);
    const first = document.documentElement.getAttribute("data-theme");
    expect(["dark", "light"]).toContain(first);
    expect(localStorage.getItem("theme")).toBe(first);
    await userEvent.click(btn);
    const second = document.documentElement.getAttribute("data-theme");
    expect(second).not.toBe(first);
    expect(localStorage.getItem("theme")).toBe(second);
  });

  test("restores saved theme", () => {
    localStorage.setItem("theme", "dark");
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  test("works when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /theme/i }));
    expect(document.documentElement.getAttribute("data-theme")).toBeTruthy();
    vi.restoreAllMocks();
  });
});

test("skills section renders grouped lists", () => {
  render(<App />);
  expect(skills.map((g) => g.area)).toEqual(["Android", "Web", "Backend", "ML"]);
  const section = within(screen.getByRole("region", { name: "Skills" }));
  for (const g of skills) {
    const group = within(section.getByRole("group", { name: g.area }));
    expect(group.getAllByRole("listitem")).toHaveLength(g.items.length);
  }
});

describe("project case studies", () => {
  test("every project has case study content", () => {
    for (const p of projects) {
      expect(p.problem.length).toBeGreaterThan(0);
      expect(p.approach.length).toBeGreaterThan(0);
      expect(p.results.length).toBeGreaterThan(0);
      expect(p.stack.length).toBeGreaterThan(0);
    }
  });

  test("opening a project shows its detail view and back returns to the list", async () => {
    render(<App />);
    const p = projects.find((x) => x.name === "Weather Dashboard")!;
    await userEvent.click(screen.getByRole("button", { name: `Read case study: ${p.name}` }));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    const detail = within(screen.getByRole("region", { name: p.name }));
    expect(detail.getByText(p.problem)).toBeInTheDocument();
    expect(detail.getByText(p.approach)).toBeInTheDocument();
    expect(detail.getByText(p.results)).toBeInTheDocument();
    expect(detail.getByText(p.stack.join(", "))).toBeInTheDocument();
    expect(detail.getByRole("link", { name: /repo/i })).toHaveAttribute("href", p.repo);
    expect(detail.getByRole("link", { name: /live/i })).toHaveAttribute("href", p.live);
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getAllByRole("article")).toHaveLength(projects.length);
  });

  test("live link is omitted when a project has none", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Read case study: Notes" }));
    expect(screen.queryByRole("link", { name: /live/i })).toBeNull();
  });
});

test("API cards show live links and health status badges from mocked fetch", async () => {
  const f = vi.fn((url: string) =>
    Promise.resolve(url.includes("inventory") ? { ok: true, status: 200 } : { ok: false, status: 503 }),
  );
  vi.stubGlobal("fetch", f);
  render(<App />);
  expect(screen.getByRole("link", { name: "Live API: Inventory API" })).toHaveAttribute("href", "https://inventory-api-tagg.onrender.com");
  expect(screen.getByRole("link", { name: "Live API: Bookstore API" })).toHaveAttribute("href", "https://bookstore-api-lhpl.onrender.com");
  expect(screen.getAllByRole("link", { name: /^Live demo:/ })).toHaveLength(3);
  expect(await screen.findByText("Live")).toBeInTheDocument();
  expect(await screen.findByText("Waking up")).toBeInTheDocument();
  vi.unstubAllGlobals();
});

test("GitHub activity section lists repos from the API", async () => {
  sessionStorage.clear();
  const body = [{ name: "demo-repo", html_url: "https://github.com/u/demo-repo", stargazers_count: 5, language: "Kotlin", pushed_at: "2026-01-02T00:00:00Z", fork: false }];
  const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, status: 200, json: async () => body } as Response);
  render(<App />);
  const section = within(screen.getByRole("region", { name: "GitHub activity" }));
  expect(await section.findByRole("link", { name: "demo-repo" })).toHaveAttribute("href", "https://github.com/u/demo-repo");
  expect(section.getByText(/★ 5/)).toBeInTheDocument();
  spy.mockRestore();
});

test("GitHub activity falls back to a profile link when the API fails", async () => {
  sessionStorage.clear();
  const spy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
  render(<App />);
  const section = within(screen.getByRole("region", { name: "GitHub activity" }));
  expect(await section.findByRole("link", { name: /GitHub profile/ })).toHaveAttribute("href", contact.github);
  spy.mockRestore();
});
