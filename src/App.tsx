import { useEffect, useState } from "react";
import { loadTheme, saveTheme, systemTheme, type Theme } from "./theme";
import { checkHealth, statusLabel, type ApiStatus } from "./status";
import { copyText } from "./clipboard";
import { parseFilters, serializeFilters } from "./filterUrl";
import { loadRepos, type Repo } from "./github";
import { allTags, categoryIcons, categoryOf, computeStats, contact, techStack, filterByQuery, filterByTag, projects, skills, type Project } from "./data";

export default function App() {
  const [initial] = useState(() => parseFilters(window.location.search));
  const [tag, setTag] = useState<string | null>(initial.tag);
  const [query, setQuery] = useState(initial.query);
  const [selected, setSelected] = useState<Project | null>(null);
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? systemTheme());
  const shown = filterByQuery(filterByTag(projects, tag), query);

  useEffect(() => {
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${serializeFilters({ tag, query })}${hash}`);
  }, [tag, query]);

  useEffect(() => {
    const onPop = () => {
      const f = parseFilters(window.location.search);
      setTag(f.tag);
      setQuery(f.query);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };

  return (
    <>
    <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to main content</a>
    <main id="main" tabIndex={-1}>
      <header className="topbar">
        <button className="icon-btn" onClick={toggleTheme}>
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="btn-label">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
        </button>
      </header>
      <section className="hero" aria-label="Introduction">
        <div className="blob blob-violet" aria-hidden="true" />
        <div className="blob blob-cyan" aria-hidden="true" />
        <h1>Sabin Khanal</h1>
        <p className="tagline">I build Android, web and game apps people love to use</p>
        <div className="cta">
          <a className="btn" href="#projects">View projects</a>
          <a className="btn btn-ghost" href="#contact">Contact</a>
          <button type="button" className="btn btn-ghost-theme print-btn" onClick={() => window.print()}>Save as PDF</button>
        </div>
      </section>
      <Stats />
      <div id="projects">
      {selected ? (
        <CaseStudy project={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
      <input
        className="search"
        type="search"
        aria-label="Search projects"
        placeholder="Search projects…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="chips">
        <button onClick={() => setTag(null)} aria-pressed={tag === null}>All</button>
        {allTags(projects).map((t) => (
          <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t}>{t}</button>
        ))}
      </div>

      <div className="bento">
        {shown.map((p) => (
          <ProjectTile key={p.name} p={p} onOpen={() => setSelected(p)} />
        ))}
      </div>
        </>
      )}

      </div>

      <Marquee />

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

      <section id="contact" aria-labelledby="contact-heading" className="card contact-card">
        <h2 id="contact-heading">Contact</h2>
        <p>Have a project or role in mind? Let's talk.</p>
        <div className="cta">
          <a className="btn" href={`mailto:${contact.email}`}>Email</a>
          <CopyEmail />
          <a className="btn btn-ghost-theme" href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </section>
      <footer className="footer">© {new Date().getFullYear()} Sabin Khanal · Built with React &amp; Vite</footer>
    </main>
    </>
  );
}

function CopyEmail() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(id);
  }, [message]);
  const supported = typeof navigator !== "undefined" && !!navigator.clipboard;
  const onCopy = async () => {
    const r = await copyText(contact.email);
    setMessage(r === "ok" ? "Email copied" : "Could not copy email. Please copy it manually.");
  };
  return (
    <>
      {supported && <button className="btn btn-ghost-theme" onClick={onCopy}>Copy email</button>}
      <span className="muted" role="status" aria-live="polite">{message}</span>
    </>
  );
}

function Stats() {
  const s = computeStats(projects);
  const items = [
    [`${s.apps}+`, "Apps built"],
    [String(s.apis), "Live APIs"],
    [String(s.tested), "Projects with automated tests"],
  ];
  return (
    <section className="stats" aria-label="Stats">
      {items.map(([n, l]) => (
        <div className="stat" key={l}>
          <strong>{n}</strong>
          <span>{l}</span>
        </div>
      ))}
    </section>
  );
}

function Marquee() {
  const stack = techStack(projects);
  const [paused, setPaused] = useState(false);
  return (
    <section className="marquee" aria-label="Tech stack" data-paused={paused ? "true" : undefined}>
      <button type="button" className="marquee-toggle" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? "Play animation" : "Pause animation"}
      </button>
      <ul className="marquee-track">
        {stack.map((t) => (
          <li className="pill" key={t}>{t}</li>
        ))}
      </ul>
      <ul className="marquee-track" aria-hidden="true">
        {stack.map((t) => (
          <li className="pill" key={t}>{t}</li>
        ))}
      </ul>
    </section>
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
    <span className="pill" role="status" data-status={status ?? "checking"}>
      {status ? statusLabel[status] : "Checking…"}
    </span>
  );
}

function Shot({ image }: { image: NonNullable<Project["image"]> }) {
  return (
    <div className={`frame frame-${image.kind}`}>
      {image.kind === "desktop" && (
        <div className="frame-bar" aria-hidden="true"><span /><span /><span /></div>
      )}
      <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
    </div>
  );
}

function CaseStudy({ project: p, onBack }: { project: Project; onBack: () => void }) {
  return (
    <section aria-label={p.name} className="card">
      <button onClick={onBack}>← Back to projects</button>
      <h2>{p.name}</h2>
      {p.image && <Shot image={p.image} />}
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

function ProjectTile({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const category = categoryOf(p);
  return (
    <article
      className={`tile${p.featured ? " tile-featured" : ""}`}
      data-category={category}
      aria-labelledby={`tile-${p.name.replace(/\s+/g, "-")}`}
    >
      {p.image && <Shot image={p.image} />}
      <div className="tile-body">
        <div className="tile-head">
          <span className="tile-icon" aria-hidden="true">{categoryIcons[category] ?? "✨"}</span>
          {p.api ? (
            <StatusBadge api={p.api} />
          ) : (
            <span className="pill">{p.live ? "Live demo" : "Open source"}</span>
          )}
        </div>
        <h2 id={`tile-${p.name.replace(/\s+/g, "-")}`}>{p.name}</h2>
        <p>{p.description}</p>
        <ul className="tags">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="tile-links">
          <button onClick={onOpen} aria-label={`Read case study: ${p.name}`}>Case study →</button>
          <a href={p.repo} target="_blank" rel="noreferrer">View code →</a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" aria-label={`Live demo: ${p.name}`}>Live demo →</a>
          )}
          {p.api && (
            <a href={p.api} target="_blank" rel="noreferrer" aria-label={`Live API: ${p.name}`}>Live API →</a>
          )}
        </div>
      </div>
    </article>
  );
}
