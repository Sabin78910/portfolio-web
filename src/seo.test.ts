import html from "../index.html?raw";
import robots from "../public/robots.txt?raw";
import sitemap from "../public/sitemap.xml?raw";
import ogImage from "../public/og-image.png?inline";

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
    expect(meta('meta[name="twitter:image"]')).toMatch(/^https:\/\/.+\.png$/);
  });

  it("uses a 1200x630 social image with a large-image card", () => {
    const url = `${SITE}og-image.png`;
    expect(meta('meta[property="og:image"]')).toBe(url);
    expect(meta('meta[name="twitter:image"]')).toBe(url);
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(meta('meta[property="og:image:width"]')).toBe("1200");
    expect(meta('meta[property="og:image:height"]')).toBe("630");
    expect(meta('meta[property="og:image:alt"]')).toBeTruthy();

    const png = Uint8Array.from(atob(ogImage.split(",")[1]), (c) => c.charCodeAt(0));
    const view = new DataView(png.buffer);
    expect(png.length).toBeLessThan(300 * 1024);
    expect(view.getUint32(16)).toBe(1200);
    expect(view.getUint32(20)).toBe(630);
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

describe("security meta", () => {
  const csp = meta('meta[http-equiv="Content-Security-Policy"]') ?? "";
  const directive = (name: string) =>
    csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? "";

  it("has a restrictive CSP", () => {
    expect(directive("default-src")).toBe("default-src 'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(directive("script-src")).toMatch(/^script-src 'self' 'sha256-[A-Za-z0-9+/]+=*'$/);
    expect(directive("object-src")).toBe("object-src 'none'");
    expect(directive("base-uri")).toBe("base-uri 'self'");
    expect(directive("style-src")).toBe("style-src 'self' https://fonts.googleapis.com");
    expect(directive("font-src")).toBe("font-src https://fonts.gstatic.com");
    expect(directive("img-src")).toBe("img-src 'self' data:");
  });

  it("limits connect-src to hosts the app calls", () => {
    expect(directive("connect-src")).toBe(
      "connect-src 'self' https://api.github.com https://inventory-api-tagg.onrender.com https://bookstore-api-lhpl.onrender.com",
    );
  });

  it("sets a referrer policy", () => {
    expect(meta('meta[name="referrer"]')).toBe("strict-origin-when-cross-origin");
  });
});
