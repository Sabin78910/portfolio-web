import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { categoryIcons, categoryOf, repoName, type Project } from "../data";
import { checkCi, checkHealth, checkHealthUrl, checkSite, ciLabel, siteLabel, statusLabel, type ApiStatus } from "../status";

const WAKE_RETRY_MS = 30000;
const OWNER = "Sabin78910";
type Dot = { state: "ok" | "warn" | "bad" | "idle" | "checking"; label: string };

export function StatusBadge({ api, health }: { api: string; health?: string }) {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => (health ? checkHealthUrl(health) : checkHealth(api));
    check().then((s) => {
      if (!active) return;
      setStatus(s);
      // Render's free tier cold-starts in 30-60s: look again once.
      if (s === "waking") timer = setTimeout(() => check().then((r) => active && setStatus(r)), WAKE_RETRY_MS);
    });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [api, health]);
  return (
    <span className="pill pill-status" role="status" data-status={status ?? "checking"}>
      {status ? statusLabel[status] : "Checking…"}
    </span>
  );
}

/** Live dot for sites (HEAD ping) and native apps (latest CI run on main). */
export function LiveDot({ p }: { p: Project }) {
  const neutral = !p.live && p.ci === false;
  const [dot, setDot] = useState<Dot>(neutral ? { state: "idle", label: "Unity · Android build" } : { state: "checking", label: "Checking…" });
  useEffect(() => {
    if (neutral) return;
    let on = true;
    if (p.live) {
      checkSite(p.live).then((s) => on && setDot({ state: s === "up" ? "ok" : s === "down" ? "bad" : "idle", label: siteLabel[s] }));
    } else {
      checkCi(OWNER, repoName(p)).then((s) => on && setDot({ state: s === "passing" ? "ok" : s === "failing" ? "bad" : "idle", label: ciLabel[s] }));
    }
    return () => {
      on = false;
    };
  }, [p, neutral]);
  return (
    <span className="status" data-state={dot.state}>
      <span className="dot" aria-hidden="true" />
      {dot.label}
    </span>
  );
}

export function Shot({ image, name }: { image: NonNullable<Project["image"]>; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`frame frame-${image.kind}`} style={{ viewTransitionName: `shot-${name.replace(/\W+/g, "-")}` } as CSSProperties}>
      {image.kind === "desktop" && (
        <div className="frame-bar" aria-hidden="true"><span /><span /><span /></div>
      )}
      {failed ? (
        <div className="frame-fallback"><span aria-hidden="true">▣</span>{name}</div>
      ) : (
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

const testCommand = (p: Project) =>
  p.stack.includes("Kotlin") ? "./gradlew test" : p.stack.some((s) => s === "Python" || s === "FastAPI") ? "pytest -q" : "npm test";

function Terminal({ p }: { p: Project }) {
  return (
    <div className="term" aria-hidden="true">
      <div className="term-bar"><span /><span /><span /><em>{repoName(p)}</em></div>
      <code>
        <span className="term-prompt">$</span> {testCommand(p)}
        {"\n"}
        <span className="term-ok">✓ {p.tests} tests passed</span>
        {p.api && (
          <>
            {"\n"}
            <span className="term-prompt">$</span> curl {new URL(p.health ?? `${p.api}/health`).pathname}
            {"\n"}
            <span className="term-ok">200 OK</span>
          </>
        )}
      </code>
      <span className="term-glyph">{categoryIcons[categoryOf(p)] ?? "✨"}</span>
    </div>
  );
}

const tilt = (e: PointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
  el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  el.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
};

export function ProjectTile({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const category = categoryOf(p);
  const id = `tile-${p.name.replace(/\s+/g, "-")}`;
  return (
    <article
      className={`tile${p.featured ? " tile-featured" : ""}`}
      data-category={category}
      data-size={p.size}
      data-kind={p.image?.kind ?? "none"}
      style={{ "--accent-c": p.accent } as CSSProperties}
      aria-labelledby={id}
      onPointerMove={tilt}
    >
      <div className="tile-media">{p.image ? <Shot image={p.image} name={p.name} /> : <Terminal p={p} />}</div>
      <div className="tile-body">
        <div className="tile-head">
          <span className="tile-icon" aria-hidden="true">{categoryIcons[category] ?? "✨"}</span>
          {p.api ? <StatusBadge api={p.api} health={p.health} /> : <span className="pill">{p.live ? "Live demo" : "Open source"}</span>}
        </div>
        <h3 id={id}>{p.name}</h3>
        <p className="tile-desc">{p.description}</p>
        <p className="tile-meta">
          {!p.api && <LiveDot p={p} />}
          <span className="tests"><span aria-hidden="true">✓</span> {p.tests} tests</span>
        </p>
        <ul className="tags" aria-label="Stack">
          {p.stack.slice(0, 4).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="tile-links">
          {p.live && (
            <a className="tl tl-primary" href={p.live} target="_blank" rel="noreferrer" aria-label={`Live demo: ${p.name}`}>Live ↗</a>
          )}
          {p.api && (
            <a className="tl tl-primary" href={p.health ?? p.api} target="_blank" rel="noreferrer" aria-label={`Live API: ${p.name}`}>API ↗</a>
          )}
          <a className="tl" href={p.repo} target="_blank" rel="noreferrer" aria-label={`Source code: ${p.name}`}>Code ↗</a>
          <button type="button" className="tl tl-case" data-case={p.slug} onClick={onOpen} aria-label={`Read case study: ${p.name}`}>Case study <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>
  );
}

const STEPS = [
  ["Problem", "problem"],
  ["Research", "research"],
  ["Design", "approach"],
  ["Result", "results"],
] as const;

export function CaseStudy({ project: p, onBack, prev, next, onGo }: { project: Project; onBack: () => void; prev: Project; next: Project; onGo: (p: Project) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [p]);
  return (
    <section aria-label={p.name} className="case" style={{ "--accent-c": p.accent } as CSSProperties}>
      <button type="button" className="back" onClick={onBack}>← Back to projects</button>
      <div className="case-grid">
        <header className="case-head">
          <p className="eyebrow">Case study · {categoryOf(p)}</p>
          <h2 ref={heading} tabIndex={-1}>{p.name}</h2>
          <p className="lede">{p.description}</p>
          <p className="tile-meta">
            {p.api ? <StatusBadge api={p.api} health={p.health} /> : <LiveDot p={p} />}
            <span className="tests"><span aria-hidden="true">✓</span> {p.tests} automated tests</span>
          </p>
          <p className="cta">
            <a className="btn" href={p.repo} target="_blank" rel="noreferrer">Repo on GitHub</a>
            {p.live && <a className="btn btn-ghost-theme" href={p.live} target="_blank" rel="noreferrer">Live site</a>}
          </p>
        </header>
        {p.image && <div className={`case-media case-media-${p.image.kind}`}><Shot image={p.image} name={p.name} /></div>}
      </div>
      <ol className="case-steps">
        {STEPS.map(([title, key], i) => (
          <li key={key}>
            <span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{p[key]}</p>
          </li>
        ))}
      </ol>
      <div className="case-stack">
        <h3>Stack</h3>
        <p>{p.stack.join(", ")}</p>
      </div>
      <nav className="case-nav" aria-label="More case studies">
        <button type="button" onClick={() => onGo(prev)}>← {prev.name}</button>
        <button type="button" onClick={() => onGo(next)}>{next.name} →</button>
      </nav>
    </section>
  );
}
