import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { allTags, computeStats, contact, filterByQuery, filterByTag, projects, skills, techStack } from "./data";

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

describe("redesign hero", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  test("hero shows headline, tagline and CTA links", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Sabin Khanal" })).toBeInTheDocument();
    expect(screen.getByText("I build Android, web and game apps people love to use")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#contact");
  });

  test("defaults to dark theme when nothing saved", () => {
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  test("theme button has an accessible name and visible label span for icon mode", () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /light theme/i });
    expect(btn.querySelector(".btn-label")).not.toBeNull();
    expect(btn.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  test("filter chips live in a scrollable container", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "All" }).parentElement).toHaveClass("chips");
  });
});

describe("bento project grid", () => {
  test("Block Drop is the featured tile with a lazy, sized store image", () => {
    render(<App />);
    const featured = projects.filter((p) => p.featured);
    expect(featured.map((p) => p.name)).toEqual(["Block Drop"]);
    const tile = screen.getByRole("article", { name: "Block Drop" });
    expect(tile).toHaveClass("tile", "tile-featured");
    const img = within(tile).getByRole("img", { name: /block drop/i });
    expect(img).toHaveAttribute("src", "/blockdrop-feature.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("width", "1024");
    expect(img).toHaveAttribute("height", "500");
  });

  test("other tiles have a category icon, gradient class, status pill and tags", () => {
    render(<App />);
    const tile = screen.getByRole("article", { name: "Notes" });
    expect(tile).not.toHaveClass("tile-featured");
    expect(tile).toHaveAttribute("data-category", "Android");
    expect(tile.querySelector(".tile-icon")).not.toBeNull();
    expect(within(tile).getByText("Open source")).toHaveClass("pill");
    expect(within(tile).getByText("Kotlin")).toBeInTheDocument();
    expect(within(screen.getByRole("article", { name: "Todo" })).getByText("Live demo")).toHaveClass("pill");
  });

  test("grid container exists", () => {
    render(<App />);
    expect(screen.getByRole("article", { name: "Notes" }).parentElement).toHaveClass("bento");
  });
});

describe("stats, tech stack and footer", () => {
  test("computeStats derives numbers from projects", () => {
    expect(computeStats(projects)).toEqual({ apps: 10, apis: 2, tested: 3 });
  });

  test("techStack is a unique, sorted union of project stacks", () => {
    const t = techStack(projects);
    expect(t).toContain("Kotlin");
    expect(new Set(t).size).toBe(t.length);
    expect(t).toEqual([...t].sort());
  });

  test("stats row renders", () => {
    render(<App />);
    const row = within(screen.getByRole("region", { name: "Stats" }));
    expect(row.getByText("10+")).toBeInTheDocument();
    expect(row.getByText("Live APIs")).toBeInTheDocument();
    expect(row.getByText("Projects with automated tests")).toBeInTheDocument();
  });

  test("marquee lists tech pills and is hidden duplicate for assistive tech", () => {
    render(<App />);
    const m = screen.getByLabelText("Tech stack");
    expect(within(m).getAllByText("Kotlin")).toHaveLength(2);
    expect(m.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  test("contact card has buttons and footer renders", () => {
    render(<App />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Sabin Khanal");
    expect(within(screen.getByRole("region", { name: "Contact" })).getAllByRole("link")[0]).toHaveClass("btn");
  });
});
