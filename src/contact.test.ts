import { buildIssueUrl, buildMailto, validateContact } from "./contact";

const form = { name: " Asha ", topic: "role" as const, message: "We are hiring a React developer." };

test("requires a name and a 10-character message", () => {
  expect(validateContact({ name: "", topic: "other", message: "hi" })).toEqual({ name: expect.any(String), message: expect.any(String) });
  expect(validateContact(form)).toEqual({});
});

test("mailto link carries an encoded subject and body", () => {
  const url = buildMailto("me@example.test", form);
  expect(url.startsWith("mailto:me@example.test?subject=")).toBe(true);
  const q = new URLSearchParams(url.split("?")[1]);
  expect(q.get("subject")).toBe("A role or interview — from Asha");
  expect(q.get("body")).toBe("We are hiring a React developer.");
});

test("GitHub issue link is prefilled and signed", () => {
  const url = new URL(buildIssueUrl("https://github.com/u/portfolio-web", form));
  expect(url.pathname).toBe("/u/portfolio-web/issues/new");
  expect(url.searchParams.get("title")).toBe("A role or interview — from Asha");
  expect(url.searchParams.get("body")).toContain("— Asha (sent from the portfolio contact form)");
});
