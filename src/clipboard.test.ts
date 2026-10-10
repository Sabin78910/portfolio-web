import { copyText } from "./clipboard";

test("success writes text and returns ok", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  expect(await copyText("a@b.c", { writeText })).toBe("ok");
  expect(writeText).toHaveBeenCalledWith("a@b.c");
});

test("rejection returns error", async () => {
  expect(await copyText("a", { writeText: vi.fn().mockRejectedValue(new Error("denied")) })).toBe("error");
});

test("missing clipboard returns unavailable", async () => {
  expect(await copyText("a", undefined)).toBe("unavailable");
});
