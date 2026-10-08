import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { allTags, filterByQuery, filterByTag, projects } from "./data";

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

test("filterByQuery matches name or description case-insensitively", () => {
  expect(filterByQuery(projects, "  ")).toHaveLength(projects.length);
  expect(filterByQuery(projects, "emi").map((p) => p.name)).toEqual(["EMI Calculator", "Loan Calculator"]);
  expect(filterByQuery(projects, "FASTAPI")).toHaveLength(1);
  expect(filterByQuery(projects, "zzz")).toHaveLength(0);
});

test("search box filters and combines with tag filter", async () => {
  render(<App />);
  await userEvent.type(screen.getByRole("searchbox", { name: /search projects/i }), "calculator");
  expect(screen.getAllByRole("article")).toHaveLength(2);
  await userEvent.click(screen.getByRole("button", { name: "Android" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
});
