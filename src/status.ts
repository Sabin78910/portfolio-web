export type ApiStatus = "live" | "waking" | "unknown";

export const statusLabel: Record<ApiStatus, string> = {
  live: "Live",
  waking: "Waking up",
  unknown: "Unknown",
};

/** Check GET {url} directly (for APIs whose health route is not /health). */
export function checkHealthUrl(url: string, fetchFn: typeof fetch = fetch, timeoutMs = 10000): Promise<ApiStatus> {
  return checkHealth(url, fetchFn, timeoutMs, "");
}

/** Check GET {baseUrl}/health. Never reports "down": errors we can't interpret are "unknown". */
export async function checkHealth(
  baseUrl: string,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 10000,
  path = "/health",
): Promise<ApiStatus> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetchFn(`${baseUrl}${path}`, { signal: ctrl.signal, mode: "no-cors" });
    // no-cors responses are opaque (status 0): the server answered, but we cannot read the status.
    if (r.ok || r.type === "opaque") return "live";
    return [502, 503, 504].includes(r.status) ? "waking" : "unknown";
  } catch (e) {
    return e instanceof DOMException && e.name === "AbortError" ? "waking" : "unknown";
  } finally {
    clearTimeout(timer);
  }
}

export type SiteStatus = "up" | "down" | "unknown";
export type CiStatus = "passing" | "failing" | "unknown";

export const siteLabel: Record<SiteStatus, string> = { up: "Online", down: "Offline", unknown: "Status unknown" };
export const ciLabel: Record<CiStatus, string> = { passing: "CI passing", failing: "CI failing", unknown: "CI status unknown" };

/** Ping a static site (GitHub Pages). Same-origin in production, so real status codes are readable. */
export async function checkSite(url: string, fetchFn: typeof fetch = fetch, timeoutMs = 8000): Promise<SiteStatus> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetchFn(url, { method: "HEAD", mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    if (r.ok || r.type === "opaque") return "up";
    return r.status >= 400 ? "down" : "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

const CI_TTL = 10 * 60 * 1000;

/** Latest completed ci.yml run on main, cached for 10 minutes to respect GitHub's anonymous rate limit. */
export async function checkCi(owner: string, repo: string, fetchFn: typeof fetch = fetch, now = Date.now()): Promise<CiStatus> {
  const key = `ci:${owner}/${repo}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key) ?? "null") as { s: CiStatus; t: number } | null;
    if (c && now - c.t < CI_TTL) return c.s;
  } catch {
    /* no cache */
  }
  let s: CiStatus = "unknown";
  try {
    const r = await fetchFn(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1`);
    if (r.ok) {
      const run = ((await r.json()) as { workflow_runs?: { conclusion: string | null }[] }).workflow_runs?.[0];
      s = run?.conclusion === "success" ? "passing" : run?.conclusion === "failure" ? "failing" : "unknown";
    }
  } catch {
    return "unknown";
  }
  try {
    sessionStorage.setItem(key, JSON.stringify({ s, t: now }));
  } catch {
    /* storage unavailable */
  }
  return s;
}
