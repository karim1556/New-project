import { Section } from "@/components/section";
import { StatCard } from "@/components/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function TeamDashboardPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const team = db.teams.find((t) => t.id === current.teamId);
  const members = db.users.filter((u) => u.role === "member" && u.teamId === current.teamId);
  const projects = db.projects.filter((p) => p.teamId === current.teamId);
  const activeProjects = projects.filter((p) => p.status !== "Completed");
  const logs = db.dailyLogs.filter((d) => d.teamId === current.teamId).slice(0, 6);
  const hackathons = db.hackathons.filter((h) => h.teamId === current.teamId);
  const announcements = db.announcements.slice(0, 3);
  const teamAttendance = db.attendance.filter((a) => a.teamId === current.teamId);
  const present = teamAttendance.filter((a) => a.present).length;
  const attendancePct = teamAttendance.length ? Math.round((present / teamAttendance.length) * 100) : 0;
  const upcomingDeadlines = activeProjects
    .slice()
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))
    .slice(0, 5);
  const staleProjects = activeProjects.filter((project) => {
    const latest = db.dailyLogs.find(
      (log) => log.teamId === current.teamId && log.projectName === project.title
    );
    if (!latest) return true;
    const days = Math.floor((Date.now() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24));
    return days > 3;
  });
  const criticalAnnouncements = db.announcements.filter((item) =>
    item.title.toUpperCase().includes("[CRITICAL]")
  );

  return (
    <>
      <section className="panel page-intro">
        <h1>{team?.name} Dashboard</h1>
        <p className="muted">Dedicated workspace for members, tasks, projects and hackathons.</p>
        <div className="stats">
          <StatCard label="Members" value={members.length} />
          <StatCard label="Active Projects" value={activeProjects.length} />
          <StatCard label="Hackathons" value={hackathons.length} />
          <StatCard label="Attendance" value={`${attendancePct}%`} />
          <StatCard label="Stale Projects" value={staleProjects.length} />
          <StatCard label="Critical Announcements" value={criticalAnnouncements.length} />
        </div>
      </section>

      <Section title="Member List">
        <p>{members.map((m) => m.name).join(", ")}</p>
      </Section>

      <Section title="Daily Task Updates">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Task</th>
                <th>Time</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{db.users.find((u) => u.id === log.memberId)?.name ?? log.memberId}</td>
                  <td>{log.taskCompleted}</td>
                  <td>{log.timeSpentHours}h</td>
                  <td>{log.progressPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Upcoming Project Deadlines">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDeadlines.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.deadline}</td>
                  <td>{project.status}</td>
                  <td>{project.progress}%</td>
                </tr>
              ))}
              {upcomingDeadlines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No active project deadlines.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Announcements">
        <div className="notice-stack">
          {announcements.map((item) => (
            <article
              key={item.id}
              className={`notice-card ${item.title.toUpperCase().includes("[CRITICAL]") ? "notice-critical" : ""}`}
            >
              <h3>{item.title}</h3>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
