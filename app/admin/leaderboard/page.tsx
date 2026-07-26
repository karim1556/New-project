import { Section } from "@/components/section";
import { assignPointsAction } from "@/lib/actions";
import { getLeaderboard } from "@/lib/queries";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function LeaderboardPage() {
  const { teamRanking, memberRanking } = await getLeaderboard();
  const db = await readDb();

  return (
    <>
      <Section title="Assign Points" subtitle="Admin controls all leaderboard scoring.">
        <form action={assignPointsAction} className="grid-form">
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
            Member (optional)
            <select name="memberId" defaultValue="">
              <option value="">Team-level points</option>
              {db.users
                .filter((u) => u.role === "member")
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Points
            <input name="points" type="number" min={1} required />
          </label>
          <label className="full-span">
            Reason
            <input name="reason" placeholder="Sprint completion / checkpoint approval" required />
          </label>
          <div className="form-actions">
            <SubmitButton label="Assign Points" pendingLabel="Assigning..." />
          </div>
        </form>
      </Section>

      <Section title="Team Leaderboard" subtitle="Points from daily activity and hackathon outcomes.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {teamRanking.map((team, index) => (
                <tr key={team.teamId}>
                  <td>#{index + 1}</td>
                  <td>{team.teamName}</td>
                  <td>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Individual Leaderboard">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {memberRanking.map((member, index) => (
                <tr key={member.memberId}>
                  <td>#{index + 1}</td>
                  <td>{member.memberName}</td>
                  <td>{member.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Recent Point Transactions">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Team</th>
                <th>Member</th>
                <th>Points</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {db.points.slice(0, 20).map((point) => (
                <tr key={point.id}>
                  <td>{new Date(point.createdAt).toLocaleString()}</td>
                  <td>{db.teams.find((t) => t.id === point.teamId)?.name ?? point.teamId}</td>
                  <td>{point.memberId ? db.users.find((u) => u.id === point.memberId)?.name ?? point.memberId : "-"}</td>
                  <td>{point.points}</td>
                  <td>{point.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
