export type ApiStatus = "live" | "waking" | "unknown";

export const statusLabel: Record<ApiStatus, string> = {
  live: "Live",
  waking: "Waking up",
  unknown: "Unknown",
};

/** Check GET {baseUrl}/health. Never reports "down": errors we can't interpret are "unknown". */
export async function checkHealth(
  baseUrl: string,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 10000,
): Promise<ApiStatus> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetchFn(`${baseUrl}/health`, { signal: ctrl.signal });
    if (r.ok) return "live";
    return [502, 503, 504].includes(r.status) ? "waking" : "unknown";
  } catch (e) {
    return e instanceof DOMException && e.name === "AbortError" ? "waking" : "unknown";
  } finally {
    clearTimeout(timer);
  }
}
