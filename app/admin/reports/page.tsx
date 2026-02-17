import { Section } from "@/components/section";
import { getWeeklyReport } from "@/lib/queries";

export default async function WeeklyReportsPage() {
  const report = await getWeeklyReport();

  return (
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
      <p className="muted section-note">
        This report is displayed on-screen. PDF export can be added later.
      </p>
    </Section>
  );
}
