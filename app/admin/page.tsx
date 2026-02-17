import { StatCard } from "@/components/stat-card";
import { Section } from "@/components/section";
import { getAdminOverview } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <>
      <section className="panel page-intro">
        <h1>Admin Dashboard</h1>
        <p className="muted">Central visibility into teams, projects, attendance and hackathon activity.</p>
        <div className="stats">
          <StatCard label="Total Teams" value={overview.totalTeams} />
          <StatCard label="Total Members" value={overview.totalMembers} />
          <StatCard label="Active Projects" value={overview.activeProjects} />
          <StatCard label="Hackathons This Month" value={overview.hackathonsThisMonth} />
          <StatCard label="Attendance" value={`${overview.attendancePct}%`} />
        </div>
      </section>

      <Section title="Recent Team Updates" subtitle="Latest daily logs submitted by members.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Project</th>
                <th>Task</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {overview.recentLogs.map((log) => {
                const member = overview.db.users.find((u) => u.id === log.memberId)?.name ?? log.memberId;
                return (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{member}</td>
                    <td>{log.projectName}</td>
                    <td>{log.taskCompleted}</td>
                    <td>{log.progressPercent}%</td>
                  </tr>
                );
              })}
              {overview.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No updates yet.
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
