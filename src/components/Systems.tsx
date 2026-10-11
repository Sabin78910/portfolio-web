import type { CSSProperties, ReactNode } from "react";
import { CountUp } from "./CountUp";
import { computeStats, projects } from "../data";

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

// Order = the release loop, clockwise from the planner. Angles place each node on the ring (desktop).
export const loopSteps = [
  { title: "Planner", file: "weekly-improve.yml", text: "A daily research pass queues at most two small, testable issues per repo.", angle: -150, icon: icon(<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>) },
  { title: "Ready issue", file: "GitHub Issues", text: "Every change starts as a scoped issue with acceptance criteria.", angle: -90, icon: icon(<><path d="M4 7v5l8 8 8-8-8-8H8z" /><circle cx="8.5" cy="8.5" r="1.2" /></>) },
  { title: "Cloud AI developer", file: "claude-agent.yml", text: "Claude in GitHub Actions writes the tests first, then the code, and opens a PR.", angle: -30, icon: icon(<><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6" /></>) },
  { title: "CI gate", file: "ci.yml · codeql.yml", text: "Lint, typecheck, tests, build, npm audit and CodeQL must pass before merge.", angle: 30, icon: icon(<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></>) },
  { title: "Deploy", file: "deploy.yml", text: "GitHub Pages, Cloudflare Workers, Render and signed Android app bundles.", angle: 90, icon: icon(<><path d="M5 15c-1 2-1 4-1 4s2 0 4-1M14 4c3 0 6 3 6 6l-7 7-6-6z" /><circle cx="14.5" cy="9.5" r="1.5" /></>) },
  { title: "Visual QA", file: "visual-qa.yml", text: "Playwright checks phone and desktop in light and dark; Android runs a 300-tap monkey test.", angle: 150, icon: icon(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>) },
];

const RX = 400, RY = 210, CX = 500, CY = 280;
const RING = `M${CX - RX} ${CY} A${RX} ${RY} 0 1 1 ${CX + RX} ${CY} A${RX} ${RY} 0 1 1 ${CX - RX} ${CY}`;
const at = (deg: number) => ({ x: CX + RX * Math.cos((deg * Math.PI) / 180), y: CY + RY * Math.sin((deg * Math.PI) / 180) });

const REPOS = 16;
const kindColor = ["#7C3AED", "#22D3EE", "#22C55E", "#F59E0B"];

export function Systems() {
  const { tests } = computeStats(projects);
  const ci = at(30), issue = at(-90);
  return (
    <section id="systems" className="systems" aria-labelledby="systems-heading">
      <div className="section-head">
        <p className="eyebrow">Systems</p>
        <h2 id="systems-heading">A release loop that runs itself</h2>
        <p className="lede">Sixteen repos run on one self-driving loop in GitHub's cloud. I set direction and review; the pipeline plans, builds, tests, ships and checks its own work.</p>
      </div>
      <div className="loop">
        <svg className="loop-ring" viewBox="0 0 1000 560" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="ring-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <path className="ring-base" d={RING} />
          <path className="ring-chord" d={`M${ci.x} ${ci.y} Q 640 250 ${issue.x} ${issue.y}`} />
          <text className="ring-note" x="690" y="246">auto-fix: a red main becomes an issue</text>
          <path className="ring-comet" d={RING} pathLength={100} />
          <path className="ring-comet ring-comet-2" d={RING} pathLength={100} />
          <path className="ring-comet ring-comet-3" d={RING} pathLength={100} />
        </svg>
        <div className="hub">
          <svg className="hub-orbit" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
            <g className="hub-dots">
              {Array.from({ length: REPOS }, (_, i) => {
                const a = (i / REPOS) * Math.PI * 2;
                return <circle key={i} cx={80 + 70 * Math.cos(a)} cy={80 + 70 * Math.sin(a)} r="4" fill={kindColor[i % 4]} />;
              })}
            </g>
          </svg>
          <div className="hub-core">
            <strong><CountUp value={REPOS} /></strong>
            <span>repos</span>
            <em>devops-hq watches all of them 24/7 and resumes after usage limits</em>
          </div>
        </div>
        <ol className="loop-steps" aria-label="Release loop">
          {loopSteps.map((s, i) => {
            const p = at(s.angle);
            return (
              <li key={s.title} className="loop-node" style={{ "--x": `${p.x / 10}%`, "--y": `${(p.y / 560) * 100}%`, "--i": i } as CSSProperties}>
                <span className="node-icon">{s.icon}</span>
                <span className="node-text">
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                  <code>{s.file}</code>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <dl className="sys-stats">
        <div><dt>Repos on autopilot</dt><dd><CountUp value={REPOS} /></dd></div>
        <div><dt>Automated tests</dt><dd><CountUp value={tests} suffix="+" /></dd></div>
        <div><dt>Workflows per repo</dt><dd><CountUp value={7} suffix="+" /></dd></div>
        <div><dt>Laptops needed</dt><dd>0</dd></div>
      </dl>
    </section>
  );
}
