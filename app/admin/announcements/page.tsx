import { Section } from "@/components/section";
import { createAnnouncementAction } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminAnnouncementsPage() {
  const db = await readDb();
  const announcements = db.announcements
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const critical = announcements.filter((item) => item.title.startsWith("[CRITICAL]"));
  const normal = announcements.filter((item) => !item.title.startsWith("[CRITICAL]"));

  return (
    <>
      <Section title="Announcement Board" subtitle="Post notices visible to all teams and members.">
        <form action={createAnnouncementAction} className="grid-form single-col">
          <label>
            Importance
            <select name="importance" defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="reminder">Reminder</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label>
            Title
            <input name="title" placeholder="Internal hackathon on Friday" required />
          </label>
          <label>
            Message
            <textarea name="message" placeholder="Share full instruction and deadlines" required />
          </label>
          <SubmitButton label="Post Announcement" pendingLabel="Posting..." />
        </form>
      </Section>

      <Section title="Critical Announcements">
        <div className="notice-stack">
          {critical.map((item) => (
            <article key={item.id} className="notice-card notice-critical">
              <span className="badge badge-critical">Critical</span>
              <h3>{item.title.replace(/^\[CRITICAL\]\s*/, "")}</h3>
              <p>{item.message}</p>
              <small className="notice-meta">{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {critical.length === 0 ? <p className="muted">No critical announcements.</p> : null}
        </div>
      </Section>

      <Section title="Recent Announcements">
        <div className="notice-stack">
          {normal.map((item) => (
            <article key={item.id} className="notice-card">
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <small className="notice-meta">{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
