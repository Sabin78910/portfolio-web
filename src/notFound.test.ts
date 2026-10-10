import html from "../public/404.html?raw";

const doc = new DOMParser().parseFromString(html, "text/html");

describe("404 page", () => {
  it("has lang, title, noindex and a message", () => {
    expect(doc.documentElement.getAttribute("lang")).toBe("en");
    expect(doc.title).toMatch(/404|not found/i);
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
    expect(doc.querySelector("h1")?.textContent).toBeTruthy();
  });

  it("links home under the Pages base path", () => {
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("/portfolio-web/");
  });

  it("supports dark mode and uses no scripts or external requests", () => {
    expect(html).toContain("prefers-color-scheme: dark");
    expect(doc.querySelector("script")).toBeNull();
    expect(doc.querySelector("link[href], img[src]")).toBeNull();
    expect(html).not.toMatch(/@import|url\(/);
  });
});
