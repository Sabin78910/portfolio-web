import { useEffect, useState } from "react";
import { loadTheme, saveTheme, systemTheme, type Theme } from "./theme";
import { allTags, contact, filterByQuery, filterByTag, projects } from "./data";

export default function App() {
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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
          <a href={p.repo} target="_blank" rel="noreferrer">View code →</a>
        </article>
      ))}

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
