import swSource from "../public/sw.js?raw";
import { registerSW } from "./registerSW";

function fakeNav() {
  return { serviceWorker: { register: vi.fn().mockResolvedValue({}) } } as unknown as Navigator & {
    serviceWorker: { register: ReturnType<typeof vi.fn> };
  };
}

describe("registerSW", () => {
  it("does nothing outside production", () => {
    const nav = fakeNav();
    expect(registerSW({ prod: false, nav, base: "./" })).toBe(false);
    expect(nav.serviceWorker.register).not.toHaveBeenCalled();
  });

  it("does nothing when service workers are unsupported", () => {
    expect(registerSW({ prod: true, nav: {} as Navigator, base: "./" })).toBe(false);
  });

  it("registers sw.js relative to the base in production, after load", () => {
    const nav = fakeNav();
    const target = new EventTarget() as unknown as Window;
    expect(registerSW({ prod: true, nav, base: "/portfolio-web/", win: target, ready: false })).toBe(true);
    expect(nav.serviceWorker.register).not.toHaveBeenCalled();
    target.dispatchEvent(new Event("load"));
    expect(nav.serviceWorker.register).toHaveBeenCalledWith("/portfolio-web/sw.js");
  });

  it("registers immediately if the page already loaded", () => {
    const nav = fakeNav();
    registerSW({ prod: true, nav, base: "./", ready: true });
    expect(nav.serviceWorker.register).toHaveBeenCalledWith("./sw.js");
  });

  it("swallows registration failures", async () => {
    const nav = fakeNav();
    nav.serviceWorker.register.mockRejectedValue(new Error("nope"));
    expect(() => registerSW({ prod: true, nav, base: "./", ready: true })).not.toThrow();
    await Promise.resolve();
  });
});

describe("sw.js", () => {
  it("uses a versioned cache and both strategies", () => {
    expect(swSource).toMatch(/const CACHE = "portfolio-v\d+"/);
    expect(swSource).toContain("networkFirst");
    expect(swSource).toContain("cacheFirst");
    expect(swSource).toContain("/assets/");
    expect(swSource).toContain("/shots/");
  });
});
