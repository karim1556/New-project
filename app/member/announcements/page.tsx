import { Section } from "@/components/section";
import { readDb } from "@/lib/db";

export default async function MemberAnnouncementsPage() {
  const db = await readDb();
  const announcements = db.announcements
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const critical = announcements.filter((item) => item.title.startsWith("[CRITICAL]"));
  const reminders = announcements.filter((item) => item.title.startsWith("[REMINDER]"));
  const normal = announcements.filter(
    (item) => !item.title.startsWith("[CRITICAL]") && !item.title.startsWith("[REMINDER]")
  );

  const cleanTitle = (title: string) =>
    title.replace(/^\[CRITICAL\]\s*/, "").replace(/^\[REMINDER\]\s*/, "");

  return (
    <>
      <Section
        title="Announcements"
        subtitle="Critical updates first, then reminders, then regular notices."
      >
        <div className="notice-stack">
          {critical.map((item) => (
            <article key={item.id} className="notice-card notice-critical">
              <span className="badge badge-critical">Critical</span>
              <h3>{cleanTitle(item.title)}</h3>
              <p>{item.message}</p>
              <small className="notice-meta">{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {critical.length === 0 ? <p className="muted">No critical announcements.</p> : null}
        </div>
      </Section>

      <Section title="Reminders">
        <div className="notice-stack">
          {reminders.map((item) => (
            <article key={item.id} className="notice-card">
              <span className="badge">Reminder</span>
              <h3>{cleanTitle(item.title)}</h3>
              <p>{item.message}</p>
              <small className="notice-meta">{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {reminders.length === 0 ? <p className="muted">No reminders right now.</p> : null}
        </div>
      </Section>

      <Section title="All Announcements">
        <div className="notice-stack">
          {normal.map((item) => (
            <article key={item.id} className="notice-card">
              <h3>{cleanTitle(item.title)}</h3>
              <p>{item.message}</p>
              <small className="notice-meta">{new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {normal.length === 0 ? <p className="muted">No regular announcements.</p> : null}
        </div>
      </Section>
    </>
  );
}
