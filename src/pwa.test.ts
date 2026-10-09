import html from "../index.html?raw";
import manifestRaw from "../public/manifest.webmanifest?raw";

const manifest = JSON.parse(manifestRaw);

describe("PWA", () => {
  it("links the manifest and theme-color in index.html", () => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector('link[rel="manifest"]')?.getAttribute("href")).toBe("manifest.webmanifest");
    expect(doc.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(manifest.theme_color);
  });

  it("has an installable manifest", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("./");
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });
});
