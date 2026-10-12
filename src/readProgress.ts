export type RectLike = { top: number; bottom: number };

/** 0 when the section top meets the viewport top, 1 when its bottom meets the viewport bottom. */
export function readProgress(rect: RectLike, viewportHeight: number): number {
  const scrollable = rect.bottom - rect.top - viewportHeight;
  if (scrollable <= 0) return rect.bottom <= viewportHeight ? 1 : 0;
  return Math.min(1, Math.max(0, -rect.top / scrollable));
}
