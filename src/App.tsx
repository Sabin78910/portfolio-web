import { useEffect, useState } from "react";
import { loadTheme, saveTheme, systemTheme, type Theme } from "./theme";
import { checkHealth, statusLabel, type ApiStatus } from "./status";
import { loadRepos, type Repo } from "./github";
import { allTags, contact, filterByQuery, filterByTag, projects, skills, type Project } from "./data";

export default function App() {
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? systemTheme());
  const shown = filterByQuery(filterByTag(projects, tag), query);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };

  return (
    <main>
      <button onClick={toggleTheme} style={{ float: "right" }}>
        {theme === "dark" ? "Light theme" : "Dark theme"}
      </button>
      <h1>Sabin Khanal</h1>
      <p className="muted">Android &amp; web developer — Kotlin, React, TypeScript, Python.</p>

      {selected ? (
        <CaseStudy project={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
      <input
        type="search"
        aria-label="Search projects"
        placeholder="Search projects…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="row" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setTag(null)} aria-pressed={tag === null}>All</button>
        {allTags(projects).map((t) => (
          <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t}>{t}</button>
        ))}
      </div>

      {shown.map((p) => (
        <article className="card" key={p.name}>
          <h2 style={{ marginTop: 0 }}>{p.name}</h2>
          <p>{p.description}</p>
          <p className="muted">{p.tags.join(" · ")}</p>
          <button onClick={() => setSelected(p)} aria-label={`Read case study: ${p.name}`}>Case study →</button>
          {" "}
          <a href={p.repo} target="_blank" rel="noreferrer">View code →</a>
          {p.live && (
            <>
              {" "}
              <a href={p.live} target="_blank" rel="noreferrer" aria-label={`Live demo: ${p.name}`}>Live demo →</a>
            </>
          )}
          {p.api && (
            <>
              {" "}
              <a href={p.api} target="_blank" rel="noreferrer" aria-label={`Live API: ${p.name}`}>Live API →</a>
              {" "}
              <StatusBadge api={p.api} />
            </>
          )}
        </article>
      ))}
        </>
      )}

      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading">Skills</h2>
        {skills.map((g) => (
          <div role="group" aria-label={g.area} key={g.area}>
            <h3>{g.area}</h3>
            <ul>
              {g.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <GitHubActivity />

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <p>
          <a href={`mailto:${contact.email}`}>Email</a>
          {" · "}
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </section>
    </main>
  );
}

function GitHubActivity() {
  const [repos, setRepos] = useState<Repo[] | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    loadRepos(contact.github.split("/").pop() ?? "").then((r) => active && setRepos(r));
    return () => {
      active = false;
    };
  }, []);
  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading">GitHub activity</h2>
      {repos === undefined && <p className="muted">Loading…</p>}
      {repos === null || (repos && repos.length === 0) ? (
        <p>
          <a href={contact.github} target="_blank" rel="noreferrer">See my GitHub profile →</a>
        </p>
      ) : (
        <ul>
          {repos?.slice(0, 6).map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
              <span className="muted">
                {" "}— {r.language ?? "n/a"} · ★ {r.stars} · updated {r.updated.slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusBadge({ api }: { api: string }) {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  useEffect(() => {
    let active = true;
    checkHealth(api).then((s) => active && setStatus(s));
    return () => {
      active = false;
    };
  }, [api]);
  return (
    <span className="muted" role="status" data-status={status ?? "checking"}>
      {status ? statusLabel[status] : "Checking…"}
    </span>
  );
}

function CaseStudy({ project: p, onBack }: { project: Project; onBack: () => void }) {
  return (
    <section aria-label={p.name} className="card">
      <button onClick={onBack}>← Back to projects</button>
      <h2>{p.name}</h2>
      <h3>Problem</h3>
      <p>{p.problem}</p>
      <h3>Approach</h3>
      <p>{p.approach}</p>
      <h3>Stack</h3>
      <p>{p.stack.join(", ")}</p>
      <h3>Results</h3>
      <p>{p.results}</p>
      <p>
        <a href={p.repo} target="_blank" rel="noreferrer">Repo</a>
        {p.live && (
          <>
            {" · "}
            <a href={p.live} target="_blank" rel="noreferrer">Live site</a>
          </>
        )}
      </p>
    </section>
  );
}
