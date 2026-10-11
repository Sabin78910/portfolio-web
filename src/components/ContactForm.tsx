import { useRef, useState, type FormEvent } from "react";
import { buildIssueUrl, buildMailto, topicLabel, validateContact, type ContactErrors, type ContactForm as Form, type Topic } from "../contact";
import { contact } from "../data";

const REPO = `${contact.github}/portfolio-web`;

export function ContactForm() {
  const [f, setF] = useState<Form>({ name: "", topic: "role", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState("");
  const form = useRef<HTMLFormElement>(null);

  const send = (via: "email" | "github") => {
    const e = validateContact(f);
    setErrors(e);
    if (e.name || e.message) {
      setSent("");
      form.current?.querySelector<HTMLElement>(e.name ? "#cf-name" : "#cf-message")?.focus();
      return;
    }
    if (via === "email") {
      window.location.assign(buildMailto(contact.email, f));
      setSent("Opening your email app with the message ready to send.");
    } else {
      window.open(buildIssueUrl(REPO, f), "_blank", "noopener");
      setSent("Opened a prefilled GitHub issue in a new tab. It is public, so leave out private details.");
    }
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send("email");
  };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <form ref={form} className="contact-form" aria-label="Write a message" noValidate onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="cf-name">Your name</label>
        <input id="cf-name" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} />
        {errors.name && <p className="field-err" id="cf-name-err">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-topic">What's it about?</label>
        <select id="cf-topic" value={f.topic} onChange={(e) => set("topic", e.target.value as Topic)}>
          {(Object.keys(topicLabel) as Topic[]).map((t) => (
            <option key={t} value={t}>{topicLabel[t]}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-err" : undefined} />
        {errors.message && <p className="field-err" id="cf-message-err">{errors.message}</p>}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn">Send by email</button>
        <button type="button" className="btn btn-ghost-theme" onClick={() => send("github")}>Post as GitHub issue</button>
      </div>
      <p className="form-status" role="status" aria-live="polite" data-done={sent ? "true" : undefined}>{sent}</p>
    </form>
  );
}
