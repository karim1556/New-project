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
  const sorted = records
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  let currentStreak = 0;
  for (const record of sorted) {
    if (record.present) currentStreak += 1;
    else break;
  }

  const monthMap = new Map<string, { present: number; total: number }>();
  records.forEach((record) => {
    const key = record.date.slice(0, 7);
    const item = monthMap.get(key) ?? { present: 0, total: 0 };
    item.total += 1;
    if (record.present) item.present += 1;
    monthMap.set(key, item);
  });
  const monthSummary = [...monthMap.entries()]
    .map(([month, value]) => ({
      month,
      present: value.present,
      total: value.total,
      pct: value.total ? Math.round((value.present / value.total) * 100) : 0
    }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));
  const recent30 = sorted.slice(0, 30);

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
          <div className="stat-card">
            <p className="muted">Current Streak</p>
            <strong>{currentStreak} days</strong>
          </div>
        </div>
      </section>

      <Section title="Monthly Attendance Summary">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Present</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {monthSummary.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>{item.present}</td>
                  <td>{item.total}</td>
                  <td>{item.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Recent Attendance (Last 30 Marks)">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent30.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>
                    <span className={`badge ${record.present ? "" : "badge-off"}`}>
                      {record.present ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
