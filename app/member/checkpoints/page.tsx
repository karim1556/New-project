import { Section } from "@/components/section";
import { submitCheckpointAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function MemberCheckpointsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const checkpoints = db.checkpoints.filter((item) => item.teamId === current.teamId);
  const submissions = db.checkpointSubmissions.filter((item) => item.teamId === current.teamId);

  return (
    <>
      <Section title="Team Checkpoints" subtitle="Submit completion proof for admin review and points.">
        <form action={submitCheckpointAction} className="grid-form">
          <label>
            Checkpoint
            <select name="checkpointId" required defaultValue="">
              <option value="" disabled>
                Select checkpoint
              </option>
              {checkpoints.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.points} pts)
                </option>
              ))}
            </select>
          </label>
          <label>
            Evidence link
            <input name="evidence" type="url" required placeholder="Drive/GitHub/Notion link" />
          </label>
          <label className="full-span">
            Notes
            <textarea name="notes" placeholder="What exactly was completed" />
          </label>
          <div className="form-actions">
            <button type="submit">Submit for Review</button>
          </div>
        </form>
      </Section>

      <Section title="Assigned Checkpoints">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Due Date</th>
                <th>Points</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.points}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
              {checkpoints.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No checkpoints assigned.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Submission Status">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Checkpoint</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Review Notes</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id}>
                  <td>{checkpoints.find((cp) => cp.id === item.checkpointId)?.title ?? item.checkpointId}</td>
                  <td>{new Date(item.submittedAt).toLocaleString()}</td>
                  <td>{item.status}</td>
                  <td>{item.reviewNotes ?? "-"}</td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No submissions yet.
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
