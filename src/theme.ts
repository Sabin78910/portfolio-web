export type Theme = "light" | "dark";

export const THEME_COLORS: Record<Theme, string> = { dark: "#1e293b", light: "#ffffff" };

const KEY = "theme";

export function loadTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // storage unavailable; theme just won't persist
  }
}

export function systemTheme(): Theme {
  return resolveTheme(null, typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches);
}

export function resolveTheme(saved: string | null, systemPrefersLight: boolean): Theme {
  return saved === "light" || saved === "dark" ? saved : systemPrefersLight ? "light" : "dark";
}
