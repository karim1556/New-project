import { Section } from "@/components/section";
import { getWeeklyReport } from "@/lib/queries";

export default async function WeeklyReportsPage() {
  const report = await getWeeklyReport();

  return (
    <>
      <Section title="Weekly Auto-Generated Report" subtitle="Last 7 days summary for club operations.">
        <div className="stats">
          <div className="stat-card">
            <p>Most Active Team</p>
            <strong>{report.mostActiveTeam}</strong>
          </div>
          <div className="stat-card">
            <p>Most Tasks Completed</p>
            <strong>{report.tasksCompleted}</strong>
          </div>
          <div className="stat-card">
            <p>Attendance Summary</p>
            <strong>{report.attendancePct}%</strong>
          </div>
          <div className="stat-card">
            <p>Hackathons Participated</p>
            <strong>{report.hackathonsParticipated}</strong>
          </div>
          <div className="stat-card">
            <p>Top Contributor</p>
            <strong>{report.topContributor}</strong>
          </div>
        </div>
        <p className="section-note muted">
          Detailed team/member/hackathon breakdown is shown below. PDF export is now available.
        </p>
        <a className="link-accent" href="/admin/reports/pdf" target="_blank" rel="noreferrer">
          Download Weekly Report (PDF)
        </a>
      </Section>

      <Section title="Team Performance Breakdown">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Tasks Completed</th>
                <th>Attendance</th>
                <th>Hackathons</th>
              </tr>
            </thead>
            <tbody>
              {report.teamPerformance.map((row) => (
                <tr key={row.teamId}>
                  <td>{row.teamName}</td>
                  <td>{row.tasksCompleted}</td>
                  <td>{row.attendancePct}%</td>
                  <td>{row.hackathons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Top Member Activity">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Team</th>
                <th>Daily Logs (7d)</th>
              </tr>
            </thead>
            <tbody>
              {report.memberPerformance.map((row) => (
                <tr key={row.memberId}>
                  <td>{row.memberName}</td>
                  <td>{row.teamName}</td>
                  <td>{row.logsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Hackathons This Week">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Team</th>
                <th>Hackathon</th>
                <th>Platform</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.weekHackathons.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.teamName}</td>
                  <td>{item.hackathonName}</td>
                  <td>{item.platform}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
              {report.weekHackathons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No hackathon activity in last 7 days.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
