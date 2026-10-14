import type { Preview, Project } from "../data";

/** Deterministic PCA-style scatter, drawn once; no data file and no chart library. */
const DOTS = Array.from({ length: 44 }, (_, i) => {
  const a = i * 2.39996;
  const r = 6 + Math.sqrt(i) * 7.2;
  return { x: 100 + Math.cos(a) * r * 1.5, y: 52 + Math.sin(a) * r * 0.62 };
});

const BARS = [16, 34, 22, 46, 28, 40, 19, 36];

function Mock({ kind, title }: { kind: Preview; title: string }) {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-bar">
        <span /><span /><span />
        <em>{title}</em>
      </div>
      <div className="mock-body" data-kind={kind}>
        {kind === "pca" && (
          <svg viewBox="0 0 200 104" className="mock-svg" focusable="false">
            <line x1="14" y1="92" x2="192" y2="92" /><line x1="14" y1="8" x2="14" y2="92" />
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="2.4" opacity={0.35 + (i % 5) * 0.14} />
            ))}
            <text x="178" y="102">PC1</text>
            <text x="2" y="12">PC2</text>
          </svg>
        )}
        {kind === "trader" && (
          <>
            <ul className="mock-rows">
              {[["#1042", "Paid"], ["#1041", "Collected"], ["#1040", "Collected"]].map(([id, state]) => (
                <li key={id}><span>Order {id}</span><em data-state={state}>{state}</em></li>
              ))}
            </ul>
            <div className="mock-bars">
              {BARS.map((h, i) => (
                <i key={i} style={{ height: `${h}px` }} />
              ))}
            </div>
          </>
        )}
        {kind === "shop" && (
          <div className="mock-tiles">
            {["2,450", "1,180", "3,900", "860", "5,200", "1,640"].map((p) => (
              <span key={p}>रू {p}</span>
            ))}
            <small>Cart · 3 items · VAT incl.</small>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectCard({ p, index }: { p: Project; index: number }) {
  return (
    <article className="tile" aria-labelledby={`p-${index}`}>
      <Mock kind={p.preview} title={p.preview === "pca" ? "pca_components.R" : p.name} />
      <div className="tile-body">
        <p className="tile-kind"><span className="tile-n">{String(index + 1).padStart(2, "0")}</span> {p.kind}</p>
        <h3 id={`p-${index}`}>{p.name}</h3>
        <p className="tile-desc">{p.description}</p>
        <ul className="tile-points">
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        <ul className="tags" aria-label={`Stack: ${p.name}`}>
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
