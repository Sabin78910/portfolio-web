import css from "./index.css?inline";

const start = css.indexOf("@media (forced-colors: active)");
const end = css.indexOf("@media print");
const block = start === -1 ? "" : css.slice(start, end > start ? end : undefined);

describe("forced-colors stylesheet", () => {
  it("has exactly one @media (forced-colors: active) block", () => {
    expect(start).toBeGreaterThanOrEqual(0);
    expect(css.split("@media (forced-colors: active)").length).toBe(2);
  });

  it("gives controls and cards a system-color border", () => {
    const m = block.replace(/^@media[^{]*\{/, "").match(/([^{}]+)\{[^}]*border:\s*1px solid (?:ButtonText|CanvasText)/);
    expect(m).toBeTruthy();
    for (const sel of [".tile", ".pill", ".tags li", "button", "input", ".icon-btn", ".marquee-toggle", ".btn"]) {
      expect(m![1], sel).toContain(sel);
    }
  });

  it("keeps the focus outline visible with system colors", () => {
    expect(block).toMatch(/:focus-visible[^{]*\{[^}]*outline:\s*2px solid (?:Highlight|LinkText|CanvasText|ButtonText)/);
  });

  it("falls back to CanvasText for hero text", () => {
    expect(block).toMatch(/\.hero[^{]*\{[^}]*color:\s*CanvasText/);
  });

  it("hard-codes no colors", () => {
    expect(block).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(block).not.toMatch(/rgba?\(|hsla?\(/);
  });
});
