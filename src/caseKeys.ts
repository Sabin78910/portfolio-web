export type CaseKeyAction = "close" | "prev" | "next";

const KEYS: Record<string, CaseKeyAction> = { Escape: "close", ArrowLeft: "prev", ArrowRight: "next" };

/** Maps a keydown to a case-study action; null for modified keys, text entry and unrelated keys. */
export function caseKeyAction(e: KeyboardEvent): CaseKeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return null;
  const t = e.target as HTMLElement | null;
  if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable || t.getAttribute?.("contenteditable") === "true")) return null;
  return KEYS[e.key] ?? null;
}
