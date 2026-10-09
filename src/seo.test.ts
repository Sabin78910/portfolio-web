import html from "../index.html?raw";
import robots from "../public/robots.txt?raw";
import sitemap from "../public/sitemap.xml?raw";

const SITE = "https://sabin78910.github.io/portfolio-web/";
const doc = new DOMParser().parseFromString(html, "text/html");
const meta = (sel: string) => doc.querySelector(sel)?.getAttribute("content");

describe("SEO", () => {
  it("has description, canonical, Open Graph and Twitter tags", () => {
    expect(meta('meta[name="description"]')).toBeTruthy();
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(SITE);
    for (const p of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
      expect(meta(`meta[property="${p}"]`), p).toBeTruthy();
    }
    expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\/.+\.png$/);
    expect(meta('meta[name="twitter:card"]')).toBe("summary");
    expect(meta('meta[name="twitter:image"]')).toMatch(/^https:\/\/.+\.png$/);
  });

  it("has JSON-LD Person", () => {
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Sabin Khanal");
    expect(ld.url).toBe(SITE);
  });

  it("ships robots.txt and sitemap.xml pointing at the site", () => {
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain(`Sitemap: ${SITE}sitemap.xml`);
    expect(sitemap).toContain(`<loc>${SITE}</loc>`);
  });
});
