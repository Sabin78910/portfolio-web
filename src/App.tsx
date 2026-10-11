import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { loadTheme, saveTheme, systemTheme, THEME_COLORS, type Theme } from "./theme";
import { copyText } from "./clipboard";
import { parseFilters, serializeFilters } from "./filterUrl";
import { loadRepos, type Repo } from "./github";
import { allTags, computeStats, contact, findBySlug, techStack, filterByQuery, filterByTag, projects, skills, type Project } from "./data";
import { Hero } from "./components/Hero";
import { CaseStudy, ProjectTile } from "./components/Work";
import { Systems } from "./components/Systems";
import { ContactForm } from "./components/ContactForm";
import { CountUp } from "./components/CountUp";

const caseFromHash = (hash: string): Project | null => {
  const m = /^#work\/([\w-]+)$/.exec(hash);
  return m ? findBySlug(projects, m[1]) ?? null : null;
};

const reduceMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Morph between grid and case study with the View Transitions API where supported. */
function transition(update: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition && !reduceMotion()) d.startViewTransition(() => flushSync(update));
  else update();
}

export default function App() {
  const [initial] = useState(() => parseFilters(window.location.search));
  const [tag, setTag] = useState<string | null>(initial.tag);
  const [query, setQuery] = useState(initial.query);
  const [selected, setSelected] = useState<Project | null>(() => caseFromHash(window.location.hash));
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? systemTheme());
  const shown = filterByQuery(filterByTag(projects, tag), query);

  useEffect(() => {
    if (!selected) return;
    const base = document.title;
    document.title = `${selected.name} case study · Sabin Khanal`;
    return () => {
      document.title = base;
    };
  }, [selected]);

  useEffect(() => {
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${serializeFilters({ tag, query })}${hash}`);
  }, [tag, query]);

  useEffect(() => {
    const onPop = () => {
      const f = parseFilters(window.location.search);
      setTag(f.tag);
      setQuery(f.query);
      setSelected(caseFromHash(window.location.hash));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };

  const scrollToWork = () =>
    document.getElementById("projects")?.scrollIntoView?.({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });

  // Opening from the grid pushes one history entry; prev/next inside a case study replace it, so Back always returns to the grid.
  const openCase = (p: Project, replace = false) => {
    const { pathname, search } = window.location;
    const url = `${pathname}${search}#work/${p.slug}`;
    if (replace) window.history.replaceState(window.history.state, "", url);
    else window.history.pushState({ case: p.slug }, "", url);
    transition(() => setSelected(p));
    scrollToWork();
  };

  const closeCase = () => {
    const slug = selected?.slug;
    const pushed = (window.history.state as { case?: string } | null)?.case;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    transition(() => setSelected(null));
    if (pushed) window.history.back();
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-case="${slug}"]`)?.focus());
  };

  // A shared #work/<slug> link lands on the case study, not the hero.
  useEffect(() => {
    if (caseFromHash(window.location.hash)) document.getElementById("projects")?.scrollIntoView?.({ block: "start" });
  }, []);

  const index = selected ? projects.indexOf(selected) : -1;
  const at = (i: number) => projects[(i + projects.length) % projects.length];

  return (
    <>
    <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to main content</a>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Sabin Khanal, back to top"><span aria-hidden="true">SK</span></a>
      <nav className="nav" aria-label="Sections">
        <a href="#projects">Work</a>
        <a href="#systems">Systems</a>
        <a href="#skills">Skills</a>
        <a href="#contact" className="nav-cta">Let's talk</a>
      </nav>
      <button className="icon-btn" onClick={toggleTheme}>
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        <span className="btn-label">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
      </button>
    </header>
    <main id="main" tabIndex={-1}>
      <Hero />
      <Stats />
      <section id="projects" className="work" aria-labelledby="work-heading">
        <div className="section-head">
          <p className="eyebrow">Selected work</p>
          <h2 id="work-heading">Real apps, live and tested</h2>
          <p className="lede">Every card pings its app right now. Open a case study for the problem, the research, the design and the result.</p>
        </div>
      {selected ? (
        <CaseStudy project={selected} onBack={closeCase} prev={at(index - 1)} next={at(index + 1)} onGo={(p) => openCase(p, true)} />
      ) : (
        <>
      <div className="work-tools">
        <input
          className="search"
          type="search"
          aria-label="Search projects"
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <button onClick={() => setTag(null)} aria-pressed={tag === null}>All</button>
          {allTags(projects).map((t) => (
            <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t}>{t}</button>
          ))}
        </div>
      </div>
      <p className="work-count" aria-live="polite">{shown.length} of {projects.length} projects</p>

      <div className="bento">
        {shown.map((p) => (
          <ProjectTile key={p.name} p={p} onOpen={() => openCase(p)} />
        ))}
      </div>
        </>
      )}
      </section>

      <Systems />

      <Marquee />

      <section id="skills" className="skills" aria-labelledby="skills-heading">
        <div className="section-head">
          <p className="eyebrow">Toolbox</p>
          <h2 id="skills-heading">Skills</h2>
        </div>
        <div className="skill-grid">
        {skills.map((g) => (
          <div role="group" aria-label={g.area} key={g.area} className="skill">
            <h3>{g.area}</h3>
            <ul>
              {g.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </section>

      <GitHubActivity />

      <section id="contact" aria-labelledby="contact-heading" className="card contact-card">
        <div className="contact-copy">
          <p className="eyebrow">Let's build something</p>
          <h2 id="contact-heading">Contact</h2>
          <p>Have a project or role in mind? Let's talk. Write a message here, or reach me directly.</p>
          <div className="cta">
            <a className="btn" href={`mailto:${contact.email}`}>Email</a>
            <CopyEmail />
            <a className="btn btn-ghost-theme" href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <ContactForm />
      </section>
      <footer className="footer">© {new Date().getFullYear()} Sabin Khanal · Built with React &amp; Vite · Hand-written WebGL hero · No trackers</footer>
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
      <span className="muted copy-status" role="status" aria-live="polite">{message}</span>
    </>
  );
}

function Stats() {
  const s = computeStats(projects);
  const items: [number, string, string][] = [
    [s.apps, "+", "Apps built"],
    [s.apis, "", "Live APIs"],
    [s.tested, "", "Projects with automated tests"],
    [s.tests, "+", "Automated tests"],
  ];
  return (
    <section className="stats" aria-label="Stats">
      {items.map(([n, suffix, l]) => (
        <div className="stat" key={l}>
          <strong><CountUp value={n} suffix={suffix} /></strong>
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
    <section aria-labelledby="activity-heading" className="activity">
      <h2 id="activity-heading">GitHub activity</h2>
      {repos === undefined && <p className="muted">Loading…</p>}
      {repos === null || (repos && repos.length === 0) ? (
        <p>
          <a href={contact.github} target="_blank" rel="noreferrer">See my GitHub profile →</a>
        </p>
      ) : (
        <ul className="activity-list">
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
