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

test("skills section renders grouped lists", () => {
  render(<App />);
  expect(skills.map((g) => g.group)).toEqual(["Android", "Web", "Backend", "ML"]);
  const section = within(screen.getByRole("region", { name: "Skills" }));
  for (const g of skills) {
    const list = within(section.getByRole("list", { name: g.group }));
    expect(list.getAllByRole("listitem")).toHaveLength(g.items.length);
  }
});
