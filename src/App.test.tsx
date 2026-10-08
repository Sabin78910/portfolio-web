import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { allTags, contact, filterByTag, projects } from "./data";

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
