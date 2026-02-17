import { Section } from "@/components/section";
import { createCheckpointAction, reviewCheckpointAction } from "@/lib/actions";
import { readDb } from "@/lib/db";

export default async function AdminCheckpointsPage() {
  const db = await readDb();

  return (
    <>
      <Section
        title="Create Team Checkpoints"
        subtitle="Define milestones and points. Team leaders submit completion for review."
      >
        <form action={createCheckpointAction} className="grid-form">
          <label>
            Team
            <select name="teamId" required defaultValue="">
              <option value="" disabled>
                Select team
              </option>
              {db.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input name="dueDate" type="date" required />
          </label>
          <label>
            Points
            <input name="points" type="number" min={1} required />
          </label>
          <label className="full-span">
            Checkpoint title
            <input name="title" placeholder="Prototype Demo v1" required />
          </label>
          <label className="full-span">
            Description
            <textarea
              name="description"
              placeholder="Include exact deliverables needed for approval"
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit">Create Checkpoint</button>
          </div>
        </form>
      </Section>

      <Section title="Open Checkpoints">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Title</th>
                <th>Due</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {db.checkpoints.map((item) => (
                <tr key={item.id}>
                  <td>{db.teams.find((t) => t.id === item.teamId)?.name ?? item.teamId}</td>
                  <td>{item.title}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Pending / Reviewed Submissions">
        <div className="notice-stack">
          {db.checkpointSubmissions.map((submission) => {
            const checkpoint = db.checkpoints.find((cp) => cp.id === submission.checkpointId);
            const team = db.teams.find((t) => t.id === submission.teamId);
            const submitter = db.users.find((u) => u.id === submission.submittedBy);

            return (
              <article key={submission.id} className="notice-card">
                <h3>{checkpoint?.title ?? submission.checkpointId}</h3>
                <p className="muted">
                  Team: {team?.name ?? submission.teamId} | Submitted by: {submitter?.name ?? submission.submittedBy}
                </p>
                <p>
                  Evidence: <a href={submission.evidence} className="link-accent" target="_blank" rel="noreferrer">Open link</a>
                </p>
                <p>Notes: {submission.notes || "-"}</p>
                <p className="notice-meta">Current status: {submission.status}</p>

                <form action={reviewCheckpointAction} className="grid-form">
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <label>
                    Decision
                    <select name="status" defaultValue={submission.status === "Pending" ? "Approved" : submission.status}>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </label>
                  <label className="full-span">
                    Review notes
                    <input name="reviewNotes" defaultValue={submission.reviewNotes ?? ""} />
                  </label>
                  <div className="form-actions">
                    <button type="submit">Save Review</button>
                  </div>
                </form>
              </article>
            );
          })}
          {db.checkpointSubmissions.length === 0 ? <p className="muted">No submissions yet.</p> : null}
        </div>
      </Section>
    </>
  );
}
