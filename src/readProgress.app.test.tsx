import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => (cb(0), 0));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});
afterEach(() => vi.unstubAllGlobals());

test("progress bar is absent on the grid and tracks scroll inside a case study", async () => {
  render(<App />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Read case study: Ludo Live" }));
  const section = screen.getByRole("region", { name: "Ludo Live" });
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
  section.getBoundingClientRect = () => ({ top: -600, bottom: 1400, height: 2000 }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  const bar = screen.getByRole("progressbar", { name: "Reading progress" });
  expect(bar).toHaveAttribute("aria-valuenow", "50");
  section.getBoundingClientRect = () => ({ top: -1200, bottom: 800, height: 2000 }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  expect(bar).toHaveAttribute("aria-valuenow", "100");
});

test("scroll listener is removed on unmount", async () => {
  const remove = vi.spyOn(window, "removeEventListener");
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "Read case study: Ludo Live" }));
  await userEvent.keyboard("{Escape}");
  expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
});
