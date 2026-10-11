import { checkCi, checkHealth, checkHealthUrl, checkSite } from "./status";

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

describe("checkSite", () => {
  test("200 or opaque is up, 4xx/5xx is down, network error is unknown", async () => {
    expect(await checkSite("https://s.test/", vi.fn().mockResolvedValue(res(200)))).toBe("up");
    expect(await checkSite("https://s.test/", vi.fn().mockResolvedValue({ ok: false, status: 0, type: "opaque" } as Response))).toBe("up");
    expect(await checkSite("https://s.test/", vi.fn().mockResolvedValue(res(404)))).toBe("down");
    expect(await checkSite("https://s.test/", vi.fn().mockRejectedValue(new TypeError("offline")))).toBe("unknown");
  });
  test("uses a cheap uncached HEAD request", async () => {
    const f = vi.fn().mockResolvedValue(res(200));
    await checkSite("https://s.test/", f);
    expect(f.mock.calls[0][1]).toMatchObject({ method: "HEAD", cache: "no-store" });
  });
});

describe("checkCi", () => {
  beforeEach(() => sessionStorage.clear());
  const runs = (conclusion: string) => ({ ok: true, status: 200, json: async () => ({ workflow_runs: [{ conclusion }] }) }) as Response;

  test("maps the latest ci.yml run on main", async () => {
    const f = vi.fn().mockResolvedValue(runs("success"));
    expect(await checkCi("o", "r", f)).toBe("passing");
    expect(f.mock.calls[0][0]).toBe("https://api.github.com/repos/o/r/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1");
    sessionStorage.clear();
    expect(await checkCi("o", "r", vi.fn().mockResolvedValue(runs("failure")))).toBe("failing");
  });
  test("API errors are unknown", async () => {
    expect(await checkCi("o", "x", vi.fn().mockResolvedValue(res(403)))).toBe("unknown");
    expect(await checkCi("o", "y", vi.fn().mockRejectedValue(new TypeError("offline")))).toBe("unknown");
  });
  test("caches for 10 minutes to respect the anonymous rate limit", async () => {
    const f = vi.fn().mockResolvedValue(runs("success"));
    await checkCi("o", "r", f, 1000);
    await checkCi("o", "r", f, 1000 + 9 * 60_000);
    expect(f).toHaveBeenCalledTimes(1);
    await checkCi("o", "r", f, 1000 + 11 * 60_000);
    expect(f).toHaveBeenCalledTimes(2);
  });
});

test("checkHealthUrl calls the full health URL as given", async () => {
  const f = vi.fn().mockResolvedValue(res(200));
  expect(await checkHealthUrl("https://x.test/v1/health", f)).toBe("live");
  expect(f.mock.calls[0][0]).toBe("https://x.test/v1/health");
});
