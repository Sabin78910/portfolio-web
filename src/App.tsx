import { useState } from "react";
import { allTags, filterByTag, projects } from "./data";

export default function App() {
  const [tag, setTag] = useState<string | null>(null);
  const shown = filterByTag(projects, tag);

  return (
    <main>
      <h1>Sabin Khanal</h1>
      <p className="muted">Android &amp; web developer — Kotlin, React, TypeScript, Python.</p>

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

      <footer className="muted">
        <a href="https://github.com/Sabin78910">GitHub</a>
      </footer>
    </main>
  );
}
