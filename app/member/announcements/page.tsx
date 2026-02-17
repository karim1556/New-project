import { Section } from "@/components/section";
import { readDb } from "@/lib/db";

export default async function MemberAnnouncementsPage() {
  const db = await readDb();

  return (
    <Section title="Announcements" subtitle="Club-wide notices from admin.">
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
  );
}
