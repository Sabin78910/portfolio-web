import { useEffect, useMemo, useRef, useState } from "react";
import { readPaused, togglePaused, writePaused } from "../hero/pause";
import { heroMode, readHeroEnv, ridgeHeight } from "../hero/support";
import { computeStats, projects } from "../data";

const LAYERS = [
  { z: 1, base: 440, scale: 210, cls: "far" },
  { z: 0.62, base: 490, scale: 160, cls: "mid" },
  { z: 0.28, base: 545, scale: 110, cls: "near" },
];

/** Static SVG range drawn from the same height function: the LCP-safe poster and the reduced-motion/low-end fallback. */
function RidgePoster() {
  const paths = useMemo(
    () =>
      LAYERS.map(({ z, base, scale, cls }) => {
        const pts: string[] = [];
        for (let i = 0; i <= 80; i++) {
          const u = (i / 80) * 2 - 1;
          pts.push(`${(i * 12.5).toFixed(1)},${(base - ridgeHeight(u, z) * scale).toFixed(1)}`);
        }
        return { cls, d: `M0,600 L${pts.join(" L")} L1000,600 Z` };
      }),
    [],
  );
  return (
    <svg className="hero-poster" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {paths.map((p) => (
        <path key={p.cls} className={`ridge ridge-${p.cls}`} d={p.d} />
      ))}
    </svg>
  );
}

export function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(readPaused);
  const handle = useRef<{ setPaused(p: boolean): void } | null>(null);
  const pausedRef = useRef(paused);
  const stats = computeStats(projects);
  useEffect(() => {
    if (heroMode(readHeroEnv()) !== "webgl") return;
    let dead = false;
    let destroy = () => {};
    const start = () =>
      import("../hero/ridge").then(({ startRidge }) => {
        if (dead || !canvas.current) return;
        const h = startRidge(canvas.current);
        if (h) {
          destroy = h.destroy;
          handle.current = h;
          h.setPaused(pausedRef.current);
          setCount(h.count);
        }
      });
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 150);
    return () => {
      dead = true;
      destroy();
    };
  }, []);
  const onToggle = () => {
    const next = togglePaused(paused);
    pausedRef.current = next;
    setPaused(next);
    writePaused(next);
    handle.current?.setPaused(next);
  };
  return (
    <section className="hero" aria-label="Introduction" id="top">
      <canvas ref={canvas} className="hero-canvas" aria-hidden="true" />
      <RidgePoster />
      <div className="blob blob-violet" aria-hidden="true" />
      <div className="blob blob-cyan" aria-hidden="true" />
      <div className="hero-inner">
        <p className="kicker"><span className="dot" aria-hidden="true" /> Software developer · Nepal</p>
        <h1>Sabin Khanal</h1>
        <p className="tagline">I build Android, web and game apps people love to use</p>
        <p className="hero-sub">
          {stats.apps} shipped apps and APIs, {stats.tests.toLocaleString("en-US")}+ automated tests, and a cloud pipeline that builds, tests and ships them with the laptop off.
        </p>
        <div className="cta">
          <a className="btn" href="#projects">View projects</a>
          <a className="btn btn-ghost" href="#contact">Contact</a>
          <button type="button" className="btn btn-ghost print-btn" onClick={() => window.print()}>Save as PDF</button>
        </div>
      </div>
      {count > 0 && (
        <button type="button" className="btn btn-ghost motion-toggle" aria-pressed={paused} onClick={onToggle}>
          Pause motion
        </button>
      )}
      {count > 0 && (
        <p className="hero-caption" aria-hidden="true">
          {count.toLocaleString("en-US")} particles · hand-written WebGL · move to stir the range
        </p>
      )}
    </section>
  );
}
