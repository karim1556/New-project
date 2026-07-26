import { Section } from "@/components/section";
import { readDb } from "@/lib/db";

export default async function AdminRegistrationsPage() {
  const db = await readDb();
  const registrations = db.clubRegistrations ?? [];

  return (
    <>
      <Section
        title="Hackathon Club 2026 Registrations"
        subtitle={`Total Registered Candidates: ${registrations.length}`}
      >
        {registrations.length === 0 ? (
          <div className="empty-state">
            <p>No club registrations received yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Class / Div</th>
                  <th>WhatsApp / Phone</th>
                  <th>Email</th>
                  <th>Primary Lang</th>
                  <th>Other Tech</th>
                  <th>Coding Level</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={reg.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{reg.name}</strong>
                    </td>
                    <td>
                      <code>{reg.studentId}</code>
                    </td>
                    <td>
                      <span className="badge">
                        {reg.class} - {reg.division}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        {reg.phone}
                      </a>
                    </td>
                    <td>{reg.email}</td>
                    <td>
                      <span className="pill-tag">{reg.primaryLanguage}</span>
                    </td>
                    <td>{reg.otherLanguages || "-"}</td>
                    <td>
                      <span className="rating-badge">
                        ⚡ Level {reg.codingLevel} / 5
                      </span>
                    </td>
                    <td>
                      {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
