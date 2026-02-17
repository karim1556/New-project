import { Section } from "@/components/section";
import { getLeaderboard } from "@/lib/queries";

export default async function LeaderboardPage() {
  const { teamRanking, memberRanking } = await getLeaderboard();

  return (
    <>
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
    </>
  );
}
