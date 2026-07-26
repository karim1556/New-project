import { Section } from "@/components/section";
import { createTeamAction, createTeamLeaderAction } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function TeamManagementPage() {
  const db = await readDb();

  return (
    <>
      <Section title="Team Management" subtitle="Create teams and monitor member distribution.">
        <form action={createTeamAction} className="grid-form">
          <label>
            Team name
            <input name="name" placeholder="Team Quantum" required />
          </label>
          <div className="form-actions">
            <SubmitButton label="Create Team" pendingLabel="Creating..." />
          </div>
        </form>
      </Section>

      <Section
        title="Team Leader Login Access"
        subtitle="Only one leader login per team can access the member dashboard."
      >
        <form action={createTeamLeaderAction} className="grid-form">
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
            Leader name
            <input name="leaderName" required />
          </label>
          <label>
            Leader email
            <input name="leaderEmail" type="email" required />
          </label>
          <label>
            Leader password
            <input name="leaderPassword" type="text" required />
          </label>
          <div className="form-actions">
            <SubmitButton label="Create / Update Leader Login" pendingLabel="Saving..." />
          </div>
        </form>
      </Section>

      <Section title="Teams Overview">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Leader Login</th>
                <th>Members</th>
                <th>Active Projects</th>
              </tr>
            </thead>
            <tbody>
              {db.teams.map((team) => {
                const members = db.users.filter((u) => u.role === "member" && u.teamId === team.id);
                const leader = members.find((m) => m.isTeamLeader);
                const activeProjects = db.projects.filter(
                  (p) => p.teamId === team.id && p.status !== "Completed"
                ).length;
                return (
                  <tr key={team.id}>
                    <td>{team.name}</td>
                    <td>{leader ? leader.email : "Not configured"}</td>
                    <td>{members.map((m) => m.name).join(", ") || "No members"}</td>
                    <td>{activeProjects}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
