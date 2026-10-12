import { fireEvent, render, screen } from "@testing-library/react";
import { Shot } from "./components/Work";
import App from "./App";

const image = { kind: "phone" as const, src: "./shots/x.webp", width: 450, height: 974, alt: "Board" };

test("project screenshots load eagerly so they never stay at opacity 0", () => {
  render(<Shot image={image} name="X" />);
  expect(screen.getByRole("img", { name: "Board" })).not.toHaveAttribute("loading", "lazy");
});

test("a screenshot that fails to load is replaced by a styled placeholder", () => {
  const { container } = render(<Shot image={image} name="X" />);
  fireEvent.error(screen.getByRole("img", { name: "Board" }));
  expect(screen.queryByRole("img", { name: "Board" })).toBeNull();
  expect(container.querySelector(".frame-fallback")).toHaveTextContent("X");
});

test("every project card keeps its case-study and filter controls", () => {
  render(<App />);
  expect(screen.getAllByRole("button", { name: /Read case study/ }).length).toBeGreaterThan(0);
});

describe("responsive CSS", () => {
  const load = async () => (await import("./index.css?inline")).default as string;

  test("filter chips wrap instead of clipping at the right edge, with 44px targets", async () => {
    const css = await load();
    expect(css).toMatch(/\.chips \{[^}]*flex-wrap: wrap;/);
    expect(css).not.toMatch(/\.chips \{[^}]*overflow-x: auto/);
    expect(css).toMatch(/\.chips button \{[^}]*min-height: 44px;/);
  });

  test("phone media height is capped and card padding reduced", async () => {
    const css = await load();
    expect(css).toMatch(/\.tile-media \{[^}]*max-height: 260px;/);
    expect(css).toMatch(/\.tile-body \{[^}]*padding: 14px 16px 16px;/);
  });
});
