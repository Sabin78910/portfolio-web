export type Topic = "role" | "project" | "other";
export type ContactForm = { name: string; topic: Topic; message: string };

export const topicLabel: Record<Topic, string> = {
  role: "A role or interview",
  project: "A project or freelance work",
  other: "Something else",
};

export type ContactErrors = Partial<Record<"name" | "message", string>>;

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (!f.name.trim()) e.name = "Please add your name.";
  if (f.message.trim().length < 10) e.message = "Please write at least 10 characters.";
  return e;
}

function subject(f: ContactForm): string {
  return `${topicLabel[f.topic]} — from ${f.name.trim()}`;
}

/** mailto: link with subject and body; the address comes from the existing contact details. */
export function buildMailto(to: string, f: ContactForm): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject(f))}&body=${encodeURIComponent(f.message.trim())}`;
}

/** Prefilled public GitHub issue on the portfolio repo (no account data leaves the browser until the user submits). */
export function buildIssueUrl(repoUrl: string, f: ContactForm): string {
  const body = `${f.message.trim()}\n\n— ${f.name.trim()} (sent from the portfolio contact form)`;
  return `${repoUrl}/issues/new?title=${encodeURIComponent(subject(f))}&body=${encodeURIComponent(body)}`;
}
