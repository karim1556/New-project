import { Section } from "@/components/section";
import { createProjectAction } from "@/lib/actions";
import { projectStatuses } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function ProjectsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const projects = db.projects.filter((p) => p.teamId === current.teamId);

  return (
    <>
      <Section title="Project Tracking" subtitle="Manage problem statements and project progress.">
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
          <button type="submit">Create / Update Project</button>
        </form>
      </Section>

      <Section title="Active Projects">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Hackathon</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.hackathonName || "-"}</td>
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
