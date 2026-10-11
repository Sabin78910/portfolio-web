import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { loopSteps } from "./components/Systems";
import { projects } from "./data";

afterEach(() => window.history.replaceState(null, "", "/"));

test("Systems section draws the release loop in order around a 16-repo hub", () => {
  render(<App />);
  const section = within(screen.getByRole("region", { name: "A release loop that runs itself" }));
  const steps = within(section.getByRole("list", { name: "Release loop" })).getAllByRole("listitem");
  expect(steps.map((s) => s.querySelector("strong")?.textContent)).toEqual(["Planner", "Ready issue", "Cloud AI developer", "CI gate", "Deploy", "Visual QA"]);
  expect(loopSteps).toHaveLength(6);
  expect(section.getAllByText("16").length).toBeGreaterThan(0);
  expect(section.getByText("Repos on autopilot")).toBeInTheDocument();
});

test("case studies follow problem, research, design, result and deep-link via the hash", async () => {
  render(<App />);
  const ludo = projects.find((p) => p.slug === "ludo-live")!;
  await userEvent.click(screen.getByRole("button", { name: "Read case study: Ludo Live" }));
  expect(window.location.hash).toBe("#work/ludo-live");
  const detail = within(screen.getByRole("region", { name: "Ludo Live" }));
  expect(detail.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Problem", "Research", "Design", "Result", "Stack"]);
  expect(detail.getByText(ludo.research)).toBeInTheDocument();
  expect(detail.getByRole("heading", { level: 2, name: "Ludo Live" })).toHaveFocus();
  await userEvent.click(detail.getByRole("button", { name: "Prism Pop →" }));
  expect(screen.getByRole("region", { name: "Prism Pop" })).toBeInTheDocument();
  expect(window.location.hash).toBe("#work/prism-pop");
});

test("loading #work/<slug> opens that case study", () => {
  window.history.replaceState(null, "", "/#work/nepse-lens");
  render(<App />);
  expect(screen.getByRole("region", { name: "NEPSE Lens" })).toBeInTheDocument();
  expect(screen.queryAllByRole("article")).toHaveLength(0);
});

test("every card shows its tests, stack and a live status", () => {
  render(<App />);
  for (const p of projects) {
    const tile = within(screen.getByRole("article", { name: p.name }));
    expect(tile.getByText(`${p.tests} tests`, { exact: false, selector: ".tests" })).toBeInTheDocument();
    expect(tile.getByRole("list", { name: "Stack" })).toBeInTheDocument();
    expect(tile.getByRole("link", { name: `Source code: ${p.name}` })).toHaveAttribute("href", p.repo);
  }
  expect(within(screen.getByRole("article", { name: "Block Drop" })).getByText("Unity · Android build")).toBeInTheDocument();
});

test("site status dot reports Online from a HEAD ping", async () => {
  const f = vi.fn((url: string) => Promise.resolve(url.includes("github.io") ? { ok: true, status: 200 } : { ok: false, status: 500 }));
  vi.stubGlobal("fetch", f);
  render(<App />);
  expect(await within(screen.getByRole("article", { name: "Prism Pop" })).findByText("Online")).toBeInTheDocument();
  vi.unstubAllGlobals();
});

describe("contact form", () => {
  test("shows inline errors and focuses the first invalid field", async () => {
    render(<App />);
    const form = within(screen.getByRole("form", { name: "Write a message" }));
    await userEvent.click(form.getByRole("button", { name: "Send by email" }));
    expect(form.getByText("Please add your name.")).toBeInTheDocument();
    expect(form.getByLabelText("Your name")).toHaveFocus();
    expect(form.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
  });

  test("opens a prefilled GitHub issue and confirms it", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<App />);
    const form = within(screen.getByRole("form", { name: "Write a message" }));
    await userEvent.type(form.getByLabelText("Your name"), "Asha");
    await userEvent.type(form.getByLabelText("Message"), "Hello, are you open to a React role?");
    await userEvent.click(form.getByRole("button", { name: "Post as GitHub issue" }));
    expect(open.mock.calls[0][0]).toMatch(/^https:\/\/github\.com\/Sabin78910\/portfolio-web\/issues\/new\?title=/);
    expect(await form.findByText(/prefilled GitHub issue/)).toBeInTheDocument();
    open.mockRestore();
  });
});

test("the site never shows a second email address", () => {
  const { container } = render(<App />);
  const emails = new Set(container.innerHTML.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []);
  expect(emails.size).toBeLessThanOrEqual(1);
});
