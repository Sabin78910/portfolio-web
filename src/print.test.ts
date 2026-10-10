import css from "./index.css?inline";

const start = css.indexOf("@media print");
const block = start === -1 ? "" : css.slice(start);

describe("print stylesheet", () => {
  it("has an @media print block", () => {
    expect(start).toBeGreaterThanOrEqual(0);
  });

  it("hides interactive and decorative elements", () => {
    const m = block.match(/([^{}]+)\{\s*display:\s*none\s*!important/);
    expect(m).toBeTruthy();
    for (const sel of [".topbar", ".search", ".chips", ".blob", ".marquee"]) {
      expect(m![1], sel).toContain(sel);
    }
  });

  it("forces light background and dark text", () => {
    expect(block).toMatch(/background:\s*#fff/);
    expect(block).toMatch(/color:\s*#000|color:\s*#111/);
  });

  it("shows URLs after external links", () => {
    expect(block).toMatch(/a\[href\^="http"\]::after\s*\{[^}]*content:\s*" \(" attr\(href\) "\)"/);
  });

  it("avoids page breaks inside cards", () => {
    expect(block).toMatch(/\.tile[^{]*\{[^}]*break-inside:\s*avoid/);
  });
});
