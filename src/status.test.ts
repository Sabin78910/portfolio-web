import { checkHealth } from "./status";

const res = (status: number) => ({ ok: status >= 200 && status < 300, status }) as Response;

test("200 from /health is live", async () => {
  const f = vi.fn().mockResolvedValue(res(200));
  expect(await checkHealth("https://x.test", f)).toBe("live");
  expect(f.mock.calls[0][0]).toBe("https://x.test/health");
});

test.each([502, 503, 504])("%i means waking up", async (s) => {
  expect(await checkHealth("https://x.test", vi.fn().mockResolvedValue(res(s)))).toBe("waking");
});

test("network/CORS error is unknown, never down", async () => {
  expect(await checkHealth("https://x.test", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))).toBe("unknown");
});

test("other error statuses are unknown", async () => {
  expect(await checkHealth("https://x.test", vi.fn().mockResolvedValue(res(404)))).toBe("unknown");
});

test("timeout means waking up", async () => {
  const f = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
  expect(await checkHealth("https://x.test", f)).toBe("waking");
});

test("requests /health with no-cors so cross-origin APIs don't log CORS errors", async () => {
  const f = vi.fn().mockResolvedValue(res(200));
  await checkHealth("https://x.test", f);
  expect(f.mock.calls[0][1].mode).toBe("no-cors");
});

test("opaque (no-cors) response means the server answered: live", async () => {
  const opaque = { ok: false, status: 0, type: "opaque" } as Response;
  expect(await checkHealth("https://x.test", vi.fn().mockResolvedValue(opaque))).toBe("live");
});
