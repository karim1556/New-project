import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function MemberAttendancePage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const records = db.attendance.filter((a) => a.memberId === current.id);
  const present = records.filter((r) => r.present).length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 0;

  return (
    <>
      <section className="panel">
        <h1>Personal Attendance</h1>
        <p className="muted">Track your attendance status over time.</p>
        <div className="stats">
          <div className="stat-card">
            <p className="muted">Attendance Percentage</p>
            <strong>{pct}%</strong>
          </div>
          <div className="stat-card">
            <p className="muted">Present Days</p>
            <strong>{present}</strong>
          </div>
          <div className="stat-card">
            <p className="muted">Total Marked Days</p>
            <strong>{records.length}</strong>
          </div>
        </div>
      </section>

      <Section title="Attendance History">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.present ? "Present" : "Absent"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
