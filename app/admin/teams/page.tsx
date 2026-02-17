import { Section } from "@/components/section";
import { createTeamAction } from "@/lib/actions";
import { readDb } from "@/lib/db";

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
            <button type="submit">Create Team</button>
          </div>
        </form>
      </Section>

      <Section title="Teams Overview">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Members</th>
                <th>Active Projects</th>
              </tr>
            </thead>
            <tbody>
              {db.teams.map((team) => {
                const members = db.users.filter((u) => u.role === "member" && u.teamId === team.id);
                const activeProjects = db.projects.filter(
                  (p) => p.teamId === team.id && p.status !== "Completed"
                ).length;
                return (
                  <tr key={team.id}>
                    <td>{team.name}</td>
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
