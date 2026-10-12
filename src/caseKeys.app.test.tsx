import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState(null, "", "/"));

test("ArrowRight opens the next case study and focuses its heading; Escape returns to the grid", async () => {
  render(<App />);
  const opener = screen.getByRole("button", { name: "Read case study: Ludo Live" });
  await userEvent.click(opener);
  const before = window.history.length;
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("heading", { level: 2, name: "Prism Pop" })).toHaveFocus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(screen.getByRole("heading", { level: 2, name: "Ludo Live" })).toHaveFocus();
  expect(window.history.length).toBe(before);
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("region", { name: "Ludo Live" })).toBeNull();
  await vi.waitFor(() => expect(screen.getByRole("button", { name: "Read case study: Ludo Live" })).toHaveFocus());
});

test("shortcuts do nothing on the grid and show a hint in the case nav", async () => {
  render(<App />);
  await userEvent.keyboard("{ArrowRight}{Escape}");
  expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
  await userEvent.click(screen.getByRole("button", { name: "Read case study: Ludo Live" }));
  expect(screen.getByText(/← → to browse, Esc to close/)).toBeInTheDocument();
});
