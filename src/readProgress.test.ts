import { readProgress } from "./readProgress";

const rect = (top: number, height: number) => ({ top, bottom: top + height });

test("top of section is 0", () => expect(readProgress(rect(0, 2000), 800)).toBe(0));
test("bottom aligned with viewport bottom is 1", () => expect(readProgress(rect(-1200, 2000), 800)).toBe(1));
test("mid-scroll", () => expect(readProgress(rect(-600, 2000), 800)).toBeCloseTo(0.5));
test("clamps above and below", () => {
  expect(readProgress(rect(300, 2000), 800)).toBe(0);
  expect(readProgress(rect(-5000, 2000), 800)).toBe(1);
});
test("section shorter than the viewport never divides by zero", () => {
  expect(readProgress(rect(0, 500), 800)).toBe(1);
  expect(readProgress(rect(600, 500), 800)).toBe(0);
  expect(readProgress(rect(0, 800), 800)).toBe(1);
});
