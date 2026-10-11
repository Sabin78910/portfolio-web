export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap";

// Added from JS so the stylesheet never blocks first paint; text renders in the fallback stack until it loads.
export function loadFonts(doc: Document = document): HTMLLinkElement {
  const existing = doc.querySelector<HTMLLinkElement>(`link[href="${FONTS_HREF}"]`);
  if (existing) return existing;
  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  doc.head.appendChild(link);
  return link;
}
