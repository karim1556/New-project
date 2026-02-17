import { Section } from "@/components/section";
import { createDailyLogAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function DailyLogsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const logs = db.dailyLogs.filter((l) => l.teamId === current.teamId);

  return (
    <>
      <Section title="Daily Work Log" subtitle="Replaces Excel-based tracking with structured updates.">
        <form action={createDailyLogAction} className="grid-form">
          <label>
            Date
            <input name="date" type="date" required />
          </label>
          <label>
            Project name
            <input name="projectName" required />
          </label>
          <label>
            Task completed
            <input name="taskCompleted" required />
          </label>
          <label>
            Time spent (hours)
            <input name="timeSpentHours" type="number" step="0.5" min={0} required />
          </label>
          <label>
            Progress (%)
            <input name="progressPercent" type="number" min={0} max={100} required />
          </label>
          <label className="full-span">
            Notes
            <textarea name="notes" />
          </label>
          <button type="submit">Submit Daily Log</button>
        </form>
      </Section>

      <Section title="Log History">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Project</th>
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
                  <td>{log.projectName}</td>
                  <td>{log.taskCompleted}</td>
                  <td>{log.timeSpentHours}h</td>
                  <td>{log.progressPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
