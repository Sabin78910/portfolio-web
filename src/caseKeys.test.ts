import { caseKeyAction } from "./caseKeys";

const ev = (key: string, extra: Partial<KeyboardEvent> = {}, target: EventTarget | null = document.body) =>
  ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, target, ...extra }) as KeyboardEvent;

test("maps Escape, ArrowLeft and ArrowRight", () => {
  expect(caseKeyAction(ev("Escape"))).toBe("close");
  expect(caseKeyAction(ev("ArrowLeft"))).toBe("prev");
  expect(caseKeyAction(ev("ArrowRight"))).toBe("next");
});

test("ignores modifier keys", () => {
  for (const m of ["ctrlKey", "metaKey", "altKey", "shiftKey"] as const) {
    expect(caseKeyAction(ev("ArrowRight", { [m]: true }))).toBeNull();
  }
});

test("ignores form fields and contenteditable", () => {
  for (const tag of ["input", "textarea", "select"]) {
    expect(caseKeyAction(ev("ArrowLeft", {}, document.createElement(tag)))).toBeNull();
  }
  const div = document.createElement("div");
  div.setAttribute("contenteditable", "true");
  expect(caseKeyAction(ev("Escape", {}, div))).toBeNull();
});

test("ignores unrelated keys", () => {
  expect(caseKeyAction(ev("a"))).toBeNull();
  expect(caseKeyAction(ev("ArrowUp"))).toBeNull();
});
