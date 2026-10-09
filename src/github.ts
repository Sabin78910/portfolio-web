export type Repo = {
  name: string;
  url: string;
  stars: number;
  language: string | null;
  updated: string;
};

type ApiRepo = {
  name: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  fork: boolean;
};

/** Fetch public, non-fork repos for a user, most recently updated first. */
export async function fetchRepos(user: string, fetchFn: typeof fetch = fetch): Promise<Repo[]> {
  const r = await fetchFn(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`);
  if (!r.ok) throw new Error(`GitHub API ${r.status}`);
  const data: unknown = await r.json();
  if (!Array.isArray(data)) throw new Error("Unexpected GitHub API response");
  return (data as ApiRepo[])
    .filter((x) => !x.fork)
    .map((x) => ({
      name: x.name,
      url: x.html_url,
      stars: x.stargazers_count,
      language: x.language,
      updated: x.pushed_at,
    }))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

/** Cached in sessionStorage; returns null (never throws) so the UI can fall back. */
export async function loadRepos(user: string, fetchFn: typeof fetch = fetch): Promise<Repo[] | null> {
  const key = `gh-repos:${user}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const parsed: unknown = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed as Repo[];
    }
  } catch {
    /* ignore corrupt cache */
  }
  try {
    const repos = await fetchRepos(user, fetchFn);
    try {
      sessionStorage.setItem(key, JSON.stringify(repos));
    } catch {
      /* storage unavailable */
    }
    return repos;
  } catch {
    return null;
  }
}
