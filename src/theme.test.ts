import html from "../index.html?raw";
import { resolveTheme, THEME_COLORS } from "./theme";

const doc = new DOMParser().parseFromString(html, "text/html");
const inline = [...doc.querySelectorAll("script:not([src]):not([type])")];

describe("resolveTheme", () => {
  it("prefers a saved value", () => {
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", true)).toBe("dark");
  });
  it("falls back to the system preference", () => {
    expect(resolveTheme(null, true)).toBe("light");
    expect(resolveTheme(null, false)).toBe("dark");
  });
  it("ignores invalid saved values", () => {
    expect(resolveTheme("purple", true)).toBe("light");
    expect(resolveTheme("", false)).toBe("dark");
  });
});

describe("pre-paint theme script", () => {
  const run = (saved: string | null | "throw", light: boolean) => {
    document.documentElement.removeAttribute("data-theme");
    document.head.innerHTML = '<meta name="theme-color" content="#000">';
    vi.stubGlobal("localStorage", {
      getItem: () => {
        if (saved === "throw") throw new Error("denied");
        return saved;
      },
    });
    vi.stubGlobal("matchMedia", () => ({ matches: light }));
    new Function(inline[0].textContent ?? "")();
    vi.unstubAllGlobals();
    return [
      document.documentElement.getAttribute("data-theme"),
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    ];
  };

  it("exists exactly once, before the module bundle", () => {
    expect(inline).toHaveLength(1);
    expect(html.indexOf(inline[0].textContent!)).toBeLessThan(html.indexOf("/src/main.tsx"));
  });
  it("applies saved, system and fallback themes with matching theme-color", () => {
    expect(run("light", false)).toEqual(["light", THEME_COLORS.light]);
    expect(run("dark", true)).toEqual(["dark", THEME_COLORS.dark]);
    expect(run(null, true)).toEqual(["light", THEME_COLORS.light]);
    expect(run("bogus", false)).toEqual(["dark", THEME_COLORS.dark]);
    expect(run("throw", true)).toEqual(["light", THEME_COLORS.light]);
  });
  it("is allowed by the CSP via hash, without unsafe-inline", async () => {
    const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')!.getAttribute("content")!;
    const bytes = new TextEncoder().encode(inline[0].textContent!);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    const hash = btoa(String.fromCharCode(...digest));
    expect(csp).toContain(`script-src 'self' 'sha256-${hash}'`);
    expect(csp).not.toContain("unsafe-inline");
  });
});
