interface Options {
  prod?: boolean;
  nav?: Navigator;
  base?: string;
  win?: Window;
  ready?: boolean;
}

// Registers the offline service worker; production builds only. Returns whether registration was scheduled.
export function registerSW({
  prod = import.meta.env.PROD,
  nav = navigator,
  base = import.meta.env.BASE_URL,
  win = window,
  ready = document.readyState === "complete",
}: Options = {}): boolean {
  if (!prod || !("serviceWorker" in nav)) return false;
  const register = () => {
    nav.serviceWorker.register(`${base}sw.js`).catch(() => {});
  };
  if (ready) register();
  else win.addEventListener("load", register, { once: true });
  return true;
}
