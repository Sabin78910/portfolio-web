import { useEffect, useState, type ReactNode } from "react";
import { loadTheme, saveTheme, systemTheme, THEME_COLORS, type Theme } from "./theme";
import { copyText } from "./clipboard";
import { about, contact, CV_FILE, education, experience, hero, heroStats, profileSummary, projects, techStack } from "./data";
import { Hero } from "./components/Hero";
import { ProjectCard } from "./components/Projects";
import { ContactForm } from "./components/ContactForm";
import { CountUp } from "./components/CountUp";

/** Section heading: a ghost watermark behind a two-tone title, as used across the page. */
function Head({ id, watermark, lead, accent, lede }: { id: string; watermark: string; lead: string; accent: string; lede?: ReactNode }) {
  return (
    <div className="section-head">
      <span className="watermark" aria-hidden="true">{watermark}</span>
      <h2 id={id}>{lead} <span className="accent">{accent}</span></h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? systemTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  // The browser jumps to the anchor before React renders it, so scroll once after the first render.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView?.({ behavior: "auto", block: "start" });
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to main content</a>
      <header className="topbar">
        <a className="brand" href="#top">{hero.name}</a>
        <nav className="nav" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#education">Education</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Light theme" : "Dark theme"}>
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="btn-label">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
        </button>
        <a className="icon-btn print-btn" href={CV_FILE} download>CV</a>
        <a href="#contact" className="nav-cta">Let's talk</a>
      </header>

      <main id="main" tabIndex={-1}>
        <Hero />

        <section className="stats" aria-label="Stats">
          {heroStats.map((s) => (
            <div className="stat" key={s.label}>
              <strong><CountUp value={s.value} suffix={s.suffix} /></strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <section id="about" aria-labelledby="about-heading">
          <Head id="about-heading" watermark="About" lead="About" accent="me" />
          <div className="about-grid">
            <div className="about-copy">
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              {about.notes.map((n) => (
                <p className="note" key={n.label}><strong>{n.label}:</strong> {n.text}</p>
              ))}
              <a className="btn btn-ghost-theme" href={contact.linkedin} target="_blank" rel="noreferrer">Find me on LinkedIn <span aria-hidden="true">↗</span></a>
            </div>
            <div className="card profile-card">
              <h3>Profile summary</h3>
              <dl>
                {profileSummary.map((r) => (
                  <div key={r.term}>
                    <dt>{r.term}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="experience" aria-labelledby="experience-heading">
          <Head
            id="experience-heading"
            watermark="Experience"
            lead="Where I've"
            accent="worked."
            lede="Technology-driven professional with 3+ years of experience in software development, project management and technical support, focused on bridging AI, APIs and automation into intelligent, scalable, data-driven solutions."
          />
          <p className="head-cta">
            <a className="btn btn-ghost-theme print-btn" href={CV_FILE} download>Download CV <span aria-hidden="true">⤓</span></a>
          </p>
          <ol className="jobs">
            {experience.map((j) => (
              <li className="card job" key={j.title}>
                <p className="dates">{j.dates}</p>
                <h3>{j.title}</h3>
                <p className="where">{j.company} · {j.place}</p>
                <ul className="job-points">
                  {j.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <ul className="tags" aria-label={`Tools: ${j.title}`}>
                  {j.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section id="education" aria-labelledby="education-heading">
          <Head id="education-heading" watermark="Education" lead="Where I've" accent="studied." />
          <ul className="schools">
            {education.map((e) => (
              <li className="card school" key={e.degree}>
                <p className="dates">{e.years}</p>
                <h3>{e.degree}</h3>
                <p className="where">{e.school}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="projects" aria-labelledby="projects-heading">
          <Head
            id="projects-heading"
            watermark="Projects"
            lead="Projects,"
            accent="built end to end."
            lede="Practical implementations in SQL, React, Python, Laravel, PHP, JavaScript, R and machine learning."
          />
          <div className="bento">
            {projects.map((p, i) => (
              <ProjectCard key={p.name} p={p} index={i} />
            ))}
          </div>
        </section>

        <Marquee />

        <section className="github" aria-labelledby="github-heading">
          <Head
            id="github-heading"
            watermark="GitHub"
            lead="More projects on"
            accent="GitHub"
            lede="Combining modern web technology with AI and machine learning to solve real business problems — and uncover the data stories behind them."
          />
          <p className="github-note">Explore the full breadth of my work, open-source contributions and personal experiments on GitHub.</p>
          <a className="btn" href={contact.github} target="_blank" rel="noreferrer">Visit GitHub <span aria-hidden="true">↗</span></a>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="card contact-card">
          <div className="contact-copy">
            <p className="eyebrow">Let's build something</p>
            <h2 id="contact-heading">Get in <span className="accent">touch.</span></h2>
            <p>Have a project or role in mind? Let's talk. Write a message here, or reach me directly.</p>
            <div className="cta">
              <a className="btn" href={`mailto:${contact.email}`}>Email</a>
              <CopyEmail />
              <a className="btn btn-ghost-theme" href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
          <ContactForm />
        </section>

        <footer className="footer">© {new Date().getFullYear()} {hero.name}</footer>
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

function Marquee() {
  const stack = techStack();
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
