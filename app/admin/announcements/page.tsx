import { Section } from "@/components/section";
import { createAnnouncementAction } from "@/lib/actions";
import { readDb } from "@/lib/db";

export default async function AdminAnnouncementsPage() {
  const db = await readDb();

  return (
    <>
      <Section title="Announcement Board" subtitle="Post notices visible to all teams and members.">
        <form action={createAnnouncementAction} className="grid-form single-col">
          <label>
            Title
            <input name="title" placeholder="Internal hackathon on Friday" required />
          </label>
          <label>
            Message
            <textarea name="message" placeholder="Share full instruction and deadlines" required />
          </label>
          <button type="submit">Post Announcement</button>
        </form>
      </Section>

      <Section title="Recent Announcements">
        <div className="notice-stack">
          {db.announcements.map((item) => (
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
