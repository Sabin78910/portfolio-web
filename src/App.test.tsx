import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { contact, CV_FILE, education, experience, hero, heroStats, profileSummary, projects, techStack } from "./data";

afterEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

describe("page structure", () => {
  it("leads with the name, tagline, location and the three hero actions", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: hero.name })).toBeInTheDocument();
    expect(screen.getByText(hero.tagline)).toBeInTheDocument();
    expect(screen.getByText(contact.location, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View my work/ })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "#contact");
  });

  it("links every nav item to a section that exists", () => {
    const { container } = render(<App />);
    const ids = within(screen.getByRole("navigation", { name: "Sections" }))
      .getAllByRole("link")
      .map((a) => a.getAttribute("href")!);
    expect(ids).toEqual(["#about", "#experience", "#education", "#projects", "#contact"]);
    for (const id of ids) expect(container.querySelector(id), id).not.toBeNull();
  });

  it("shows the headline stats", () => {
    render(<App />);
    const row = within(screen.getByRole("region", { name: "Stats" }));
    for (const s of heroStats) expect(row.getByText(s.label)).toBeInTheDocument();
    expect(row.getByText("100%")).toBeInTheDocument();
  });

  it("lists the profile summary rows", () => {
    render(<App />);
    const card = within(screen.getByRole("region", { name: /About/ }));
    for (const r of profileSummary) expect(card.getByText(r.term)).toBeInTheDocument();
  });

  it("lists every job with its dates, employer and bullets", () => {
    render(<App />);
    const list = within(screen.getByRole("region", { name: /Where I've worked/ }));
    for (const j of experience) {
      expect(list.getByRole("heading", { level: 3, name: j.title })).toBeInTheDocument();
      expect(list.getByText(j.dates)).toBeInTheDocument();
      for (const p of j.points) expect(list.getByText(p)).toBeInTheDocument();
    }
  });

  it("lists every school", () => {
    render(<App />);
    const list = within(screen.getByRole("region", { name: /Where I've studied/ }));
    for (const e of education) expect(list.getByRole("heading", { level: 3, name: e.degree })).toBeInTheDocument();
  });

  it("gives every project a numbered card with its bullets and stack", () => {
    render(<App />);
    projects.forEach((p, i) => {
      const card = within(screen.getByRole("article", { name: p.name }));
      expect(card.getByText(String(i + 1).padStart(2, "0"))).toBeInTheDocument();
      for (const pt of p.points) expect(card.getByText(pt)).toBeInTheDocument();
      expect(card.getByRole("list", { name: `Stack: ${p.name}` })).toBeInTheDocument();
    });
  });

  it("sends people to the real GitHub and LinkedIn profiles", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /Visit GitHub/ })).toHaveAttribute("href", contact.github);
    expect(screen.getByRole("link", { name: /Find me on LinkedIn/ })).toHaveAttribute("href", contact.linkedin);
  });

  it("never shows a second email address", () => {
    const { container } = render(<App />);
    const emails = new Set(container.innerHTML.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []);
    expect(emails.size).toBeLessThanOrEqual(1);
  });
});

describe("controls", () => {
  it("toggles the theme and remembers it", async () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /theme/i });
    expect(btn.querySelector(".btn-label")).not.toBeNull();
    const before = document.documentElement.getAttribute("data-theme");
    await userEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).not.toBe(before);
    expect(localStorage.getItem("theme")).toBe(document.documentElement.getAttribute("data-theme"));
  });

  it("pauses the tech strip", async () => {
    render(<App />);
    const strip = screen.getByLabelText("Tech stack");
    expect(within(strip).getAllByRole("listitem").length).toBe(techStack().length);
    await userEvent.click(within(strip).getByRole("button", { name: "Pause animation" }));
    expect(strip).toHaveAttribute("data-paused", "true");
    expect(within(strip).getByRole("button", { name: "Play animation" })).toHaveAttribute("aria-pressed", "true");
  });

  it("downloads the CV PDF from every CV link", () => {
    render(<App />);
    const links = [...screen.getAllByRole("link", { name: /Download CV/ }), screen.getByRole("link", { name: "CV" })];
    expect(links).toHaveLength(3);
    for (const a of links) {
      expect(a).toHaveAttribute("href", CV_FILE);
      expect(a).toHaveAttribute("download");
    }
  });

  it("copies the email address", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith(contact.email);
    expect(await screen.findByText("Email copied")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("skip link moves focus to main", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("link", { name: "Skip to main content" }));
    expect(screen.getByRole("main")).toHaveFocus();
  });
});

describe("contact form", () => {
  it("shows inline errors and focuses the first invalid field", async () => {
    render(<App />);
    const form = within(screen.getByRole("form", { name: "Write a message" }));
    await userEvent.click(form.getByRole("button", { name: "Send by email" }));
    expect(form.getByText("Please add your name.")).toBeInTheDocument();
    expect(form.getByLabelText("Your name")).toHaveFocus();
    expect(form.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
  });

  it("opens a prefilled GitHub issue and confirms it", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<App />);
    const form = within(screen.getByRole("form", { name: "Write a message" }));
    await userEvent.type(form.getByLabelText("Your name"), "Asha");
    await userEvent.type(form.getByLabelText("Message"), "Hello, are you open to a Flask role?");
    await userEvent.click(form.getByRole("button", { name: "Post as GitHub issue" }));
    expect(open.mock.calls[0][0]).toMatch(/^https:\/\/github\.com\/Sabin78910\/portfolio-web\/issues\/new\?title=/);
    expect(await form.findByText(/prefilled GitHub issue/)).toBeInTheDocument();
    open.mockRestore();
  });
});
