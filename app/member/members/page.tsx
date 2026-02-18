import { Section } from "@/components/section";
import { createTeamMemberAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function MemberManagementPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const members = db.users.filter((u) => u.role === "member" && u.teamId === current.teamId);

  return (
    <>
      <Section
        title="Add Team Members"
        subtitle="Team leader can onboard members for attendance, projects, hackathons and tracking."
      >
        <form action={createTeamMemberAction} className="grid-form">
          <label>
            Member name
            <input name="name" required />
          </label>
          <label>
            Member email
            <input name="email" type="email" required />
          </label>
          <label>
            Temporary password
            <input name="password" type="text" required />
          </label>
          <div className="form-actions">
            <SubmitButton label="Add Team Member" pendingLabel="Adding..." />
          </div>
        </form>
      </Section>

      <Section title="Current Team Members">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role Access</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.isTeamLeader ? "Team Leader" : "Team Member (non-dashboard login)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
