import { useEffect, useMemo, useRef, useState } from "react";
import { readPaused, togglePaused, writePaused } from "../hero/pause";
import { heroMode, readHeroEnv, ridgeHeight } from "../hero/support";
import { contact, CV_FILE, hero } from "../data";

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

/** The photo is optional: a missing public/portrait.jpg falls back to the monogram instead of a broken image. */
function Portrait() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="portrait" aria-hidden={failed ? "true" : undefined}>
      {failed ? (
        <span className="portrait-fallback">SK</span>
      ) : (
        <img src="./portrait.jpg" width={593} height={760} alt={`Portrait of ${hero.name}`} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(readPaused);
  const handle = useRef<{ setPaused(p: boolean): void } | null>(null);
  const pausedRef = useRef(paused);
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
        <div className="hero-copy">
          <p className="kicker">Hello, I'm</p>
          <h1>{hero.name}</h1>
          <p className="tagline">{hero.tagline}</p>
          <p className="hero-place"><span aria-hidden="true">📍</span> {contact.location}</p>
          <div className="cta">
            <a className="btn" href="#projects">View my work <span aria-hidden="true">→</span></a>
            <a className="btn btn-ghost" href="#contact">Get in touch</a>
            <a className="btn btn-ghost print-btn" href={CV_FILE} download>Download CV <span aria-hidden="true">⤓</span></a>
          </div>
          <ul className="socials">
            <li><a href={contact.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">{"{ }"}</a></li>
            <li><a href={contact.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">in</a></li>
            <li><a href={`mailto:${contact.email}`} aria-label="Email Sabin Khanal">@</a></li>
          </ul>
        </div>
        <Portrait />
      </div>
      {count > 0 && (
        <button type="button" className="btn btn-ghost motion-toggle" aria-pressed={paused} onClick={onToggle}>
          Pause motion
        </button>
      )}
    </section>
  );
}
