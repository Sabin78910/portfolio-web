import { parseFilters, serializeFilters } from "./filterUrl";

test("parses valid category and query", () => {
  expect(parseFilters("?category=Android&q=block")).toEqual({ tag: "Android", query: "block" });
});

test("ignores unknown category", () => {
  expect(parseFilters("?category=Nope&q=x")).toEqual({ tag: null, query: "x" });
});

test("empty input gives defaults", () => {
  expect(parseFilters("")).toEqual({ tag: null, query: "" });
});

test("decodes URL-encoded input", () => {
  expect(parseFilters("?q=fast%20api%26more")).toEqual({ tag: null, query: "fast api&more" });
});

test("serializes defaults to empty string", () => {
  expect(serializeFilters({ tag: null, query: "" })).toBe("");
});

test("serializes and encodes values", () => {
  expect(serializeFilters({ tag: "Android", query: "a b" })).toBe("?category=Android&q=a+b");
  expect(serializeFilters({ tag: null, query: "x" })).toBe("?q=x");
});
