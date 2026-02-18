import { Section } from "@/components/section";
import { createHackathonAction } from "@/lib/actions";
import { hackathonStatuses } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function HackathonsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const entries = db.hackathons.filter((h) => h.teamId === current.teamId);
  const members = db.users.filter((u) => u.role === "member" && u.teamId === current.teamId);

  return (
    <>
      <Section title="External Hackathon Tracker" subtitle="Track registrations, submissions and outcomes.">
        <form action={createHackathonAction} className="grid-form">
          <label>
            Hackathon name
            <input name="hackathonName" required />
          </label>
          <label>
            Platform
            <input name="platform" placeholder="Devfolio / Unstop" required />
          </label>
          <label>
            Date
            <input name="date" type="date" required />
          </label>
          <label>
            Status
            <select name="status" defaultValue="Registered">
              {hackathonStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Participant IDs (comma-separated)
            <input name="participantIds" placeholder={members.map((m) => m.id).join(", ")} />
          </label>
          <label className="full-span">
            Result or notes
            <textarea name="resultNotes" />
          </label>
          <SubmitButton label="Save Hackathon Entry" pendingLabel="Saving..." />
        </form>
      </Section>

      <Section title="Hackathon Records">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Participants</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.hackathonName}</td>
                  <td>{entry.platform}</td>
                  <td>
                    {entry.participatingMemberIds
                      .map((id) => db.users.find((u) => u.id === id)?.name ?? id)
                      .join(", ")}
                  </td>
                  <td>{entry.date}</td>
                  <td>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
