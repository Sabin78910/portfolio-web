import { fetchRepos, loadRepos, type Repo } from "./github";

const raw = [
  { name: "a", html_url: "https://github.com/u/a", stargazers_count: 3, language: "Kotlin", pushed_at: "2026-01-02T00:00:00Z", fork: false },
  { name: "b", html_url: "https://github.com/u/b", stargazers_count: 9, language: null, pushed_at: "2026-03-01T00:00:00Z", fork: false },
  { name: "c", html_url: "https://github.com/u/c", stargazers_count: 99, language: "Go", pushed_at: "2026-05-01T00:00:00Z", fork: true },
];
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

beforeEach(() => sessionStorage.clear());

test("fetchRepos maps fields, skips forks, sorts by last update", async () => {
  const f = vi.fn().mockResolvedValue(ok(raw));
  const repos = await fetchRepos("u", f);
  expect(f.mock.calls[0][0]).toContain("https://api.github.com/users/u/repos");
  expect(repos.map((r) => r.name)).toEqual(["b", "a"]);
  expect(repos[1]).toEqual({ name: "a", url: "https://github.com/u/a", stars: 3, language: "Kotlin", updated: "2026-01-02T00:00:00Z" });
  expect(repos[0].language).toBeNull();
});

test("loadRepos caches in sessionStorage", async () => {
  const f = vi.fn().mockResolvedValue(ok(raw));
  const first = await loadRepos("u", f);
  const second = await loadRepos("u", f);
  expect(f).toHaveBeenCalledTimes(1);
  expect(second).toEqual(first);
});

test("loadRepos returns null on HTTP error (e.g. rate limit)", async () => {
  const f = vi.fn().mockResolvedValue({ ok: false, status: 403 } as Response);
  expect(await loadRepos("u", f)).toBeNull();
});

test("loadRepos returns null on network error or bad payload", async () => {
  expect(await loadRepos("u", vi.fn().mockRejectedValue(new TypeError("x")))).toBeNull();
  expect(await loadRepos("u", vi.fn().mockResolvedValue(ok({ message: "nope" })))).toBeNull();
});

test("corrupt cache is ignored and refetched", async () => {
  sessionStorage.setItem("gh-repos:u", "{not json");
  const f = vi.fn().mockResolvedValue(ok(raw));
  const repos = (await loadRepos("u", f)) as Repo[];
  expect(repos).toHaveLength(2);
});
