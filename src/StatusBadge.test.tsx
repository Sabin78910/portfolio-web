import { act, render, screen } from "@testing-library/react";
import { StatusBadge } from "./components/Work";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("retries once after 30s when the first check is waking", async () => {
  vi.useFakeTimers();
  const f = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 503 })
    .mockResolvedValueOnce({ ok: true, status: 200 });
  vi.stubGlobal("fetch", f);
  render(<StatusBadge api="https://x.test" />);
  await act(async () => {});
  expect(screen.getByRole("status")).toHaveTextContent("Waking up");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(f).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("status")).toHaveTextContent("Live");
});

test("does not retry if unmounted before 30s", async () => {
  vi.useFakeTimers();
  const f = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  vi.stubGlobal("fetch", f);
  const { unmount } = render(<StatusBadge api="https://x.test" />);
  await act(async () => {});
  unmount();
  await vi.advanceTimersByTimeAsync(60000);
  expect(f).toHaveBeenCalledTimes(1);
});

test("retries only once", async () => {
  vi.useFakeTimers();
  const f = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  vi.stubGlobal("fetch", f);
  render(<StatusBadge api="https://x.test" />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(120000);
  });
  expect(f).toHaveBeenCalledTimes(2);
});
