import html from "../index.html?raw";
import { describe, expect, it } from "vitest";
import { FONTS_HREF, loadFonts } from "./fonts";

describe("loadFonts", () => {
  it("adds the stylesheet once", () => {
    loadFonts();
    loadFonts();
    expect(document.head.querySelectorAll(`link[href="${FONTS_HREF}"]`)).toHaveLength(1);
  });
  it("is not render-blocking in index.html", () => {
    expect(html).not.toContain('rel="stylesheet"');
  });
});

describe("theme toggle", () => {
  it("has an accessible name even when the label is hidden on mobile", async () => {
    const { render, screen } = await import("@testing-library/react");
    const { default: App } = await import("./App");
    render(<App />);
    expect(screen.getAllByRole("button").every((b) => b.getAttribute("aria-label") || b.textContent?.trim())).toBe(true);
    expect(document.querySelector(".icon-btn")!.getAttribute("aria-label")).toMatch(/theme/);
  });
});
