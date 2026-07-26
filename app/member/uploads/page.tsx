import { Section } from "@/components/section";
import { createFileAttachmentAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function FileUploadsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const projects = db.projects.filter((p) => p.teamId === current.teamId);
  const hackathons = db.hackathons.filter((h) => h.teamId === current.teamId);
  const files = db.files.filter((f) => f.teamId === current.teamId);

  return (
    <>
      <Section title="File Upload System" subtitle="Attach links for decks, repos, demos, and screenshots.">
        <form action={createFileAttachmentAction} className="grid-form">
          <label>
            Target type
            <select name="targetType" defaultValue="project">
              <option value="project">Project</option>
              <option value="hackathon">Hackathon</option>
            </select>
          </label>
          <label>
            Target ID
            <input
              name="targetId"
              placeholder={`Projects: ${projects.map((p) => p.id).join(", ")} | Hackathons: ${hackathons
                .map((h) => h.id)
                .join(", ")}`}
              required
            />
          </label>
          <label>
            Label
            <input name="label" placeholder="Pitch deck / GitHub / Demo video" required />
          </label>
          <label>
            URL
            <input name="fileUrl" type="url" required />
          </label>
          <SubmitButton label="Attach File Link" pendingLabel="Attaching..." />
        </form>
      </Section>

      <Section title="Attached Files">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>Target</th>
                <th>Link</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.label}</td>
                  <td>
                    {file.targetType} ({file.targetId})
                  </td>
                  <td>
                    <a href={file.fileUrl} target="_blank" rel="noreferrer" className="link-accent">
                      Open
                    </a>
                  </td>
                  <td>{new Date(file.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
