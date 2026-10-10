import securityTxt from "../public/.well-known/security.txt?raw";
import sitemap from "../public/sitemap.xml?raw";

const field = (name: string) =>
  securityTxt.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1].trim();

describe("security.txt (RFC 9116)", () => {
  it("has a mailto or https Contact and Preferred-Languages", () => {
    expect(field("Contact")).toMatch(/^(mailto:.+@.+|https:\/\/.+)$/);
    expect(field("Preferred-Languages")).toBe("en");
  });

  it("has an Expires date that is valid, in the future and under a year away", () => {
    const raw = field("Expires");
    expect(raw).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    const ms = Date.parse(raw as string);
    expect(Number.isNaN(ms)).toBe(false);
    expect(ms).toBeGreaterThan(Date.now());
    expect(ms).toBeLessThan(Date.now() + 366 * 24 * 3600 * 1000);
  });

  it("has a Canonical URL under the sitemap's site URL", () => {
    const site = sitemap.match(/<loc>(.+?)<\/loc>/)?.[1];
    expect(site).toBeTruthy();
    expect(field("Canonical")).toBe(`${site}.well-known/security.txt`);
  });
});
