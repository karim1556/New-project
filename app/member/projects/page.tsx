import { Section } from "@/components/section";
import { createProjectAction, updateProjectProgressAction } from "@/lib/actions";
import { projectStatuses } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function ProjectsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const projects = db.projects.filter((p) => p.teamId === current.teamId);
  const projectUpdateRows = projects.map((project) => {
    const latestLog = db.dailyLogs.find(
      (log) => log.teamId === current.teamId && log.projectName === project.title
    );
    const daysSinceUpdate = latestLog
      ? Math.floor((Date.now() - new Date(latestLog.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return {
      ...project,
      latestLog,
      daysSinceUpdate
    };
  });

  return (
    <>
      <Section title="Create New Project" subtitle="Create once, then update progress continuously below.">
        <form action={createProjectAction} className="grid-form">
          <label>
            Project title
            <input name="title" required />
          </label>
          <label>
            Hackathon name (optional)
            <input name="hackathonName" />
          </label>
          <label>
            Start date
            <input name="startDate" type="date" required />
          </label>
          <label>
            Deadline
            <input name="deadline" type="date" required />
          </label>
          <label>
            Progress (%)
            <input name="progress" type="number" min={0} max={100} defaultValue={0} required />
          </label>
          <label>
            Status
            <select name="status" defaultValue="Planning">
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span">
            Description
            <textarea name="description" required />
          </label>
          <button type="submit">Create Project</button>
        </form>
      </Section>

      <Section
        title="Continuous Project Updates"
        subtitle="Use this every day or twice a week to keep project tracking live."
      >
        <form action={updateProjectProgressAction} className="grid-form">
          <label>
            Project
            <select name="projectId" required defaultValue="">
              <option value="" disabled>
                Select project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Update date
            <input name="updateDate" type="date" required />
          </label>
          <label>
            Progress (%)
            <input name="progress" type="number" min={0} max={100} required />
          </label>
          <label>
            Status
            <select name="status" defaultValue="Development">
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time spent (hours)
            <input name="timeSpentHours" type="number" min={0} step="0.5" defaultValue={2} />
          </label>
          <label className="full-span">
            Update summary
            <input name="summary" placeholder="What changed in this update?" required />
          </label>
          <label className="full-span">
            Notes
            <textarea name="notes" placeholder="Blockers, dependencies, next steps" />
          </label>
          <button type="submit">Save Project Update</button>
        </form>
      </Section>

      <Section title="Project Health View">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Hackathon</th>
                <th>Last Update</th>
                <th>Update Freshness</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {projectUpdateRows.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.hackathonName || "-"}</td>
                  <td>{project.latestLog?.date ?? "No updates yet"}</td>
                  <td>
                    {project.daysSinceUpdate === null
                      ? "No updates"
                      : project.daysSinceUpdate <= 2
                        ? "On track"
                        : project.daysSinceUpdate <= 7
                          ? "Needs update"
                          : "Stale"}
                  </td>
                  <td>
                    {project.startDate} to {project.deadline}
                  </td>
                  <td>{project.status}</td>
                  <td>{project.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
