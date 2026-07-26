import { Section } from "@/components/section";
import { getTeamWorkforceOverview } from "@/lib/queries";

export default async function TeamWorkforcePage() {
  const overview = await getTeamWorkforceOverview();

  return (
    <>
      <section className="panel page-intro">
        <h1>Team Workforce</h1>
        <p className="muted">
          One place to view all teams, members, their current projects, and attendance status.
        </p>
        <div className="stats">
          <div className="stat-card">
            <p>Total Teams</p>
            <strong>{overview.totalTeams}</strong>
          </div>
          <div className="stat-card">
            <p>Total Members</p>
            <strong>{overview.totalMembers}</strong>
          </div>
        </div>
      </section>

      <Section title="Team + Member + Project + Attendance">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Member</th>
                <th>Current Project</th>
                <th>Attendance</th>
                <th>Present Days</th>
                <th>Last Marked</th>
                <th>Last Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.teams.flatMap((team) =>
                team.members.length > 0 ? (
                  team.members.map((member, index) => (
                    <tr key={member.memberId}>
                      <td>{index === 0 ? team.teamName : ""}</td>
                      <td>{member.memberName}</td>
                      <td>{member.currentProject}</td>
                      <td>{member.attendancePct}%</td>
                      <td>
                        {member.presentDays}/{member.totalAttendance}
                      </td>
                      <td>{member.lastAttendanceDate}</td>
                      <td>
                        <span
                          className={`badge ${
                            member.lastAttendanceStatus === "Absent"
                              ? "badge-off"
                              : member.lastAttendanceStatus === "No record"
                                ? "badge-muted"
                                : ""
                          }`}
                        >
                          {member.lastAttendanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={team.teamId}>
                    <td>{team.teamName}</td>
                    <td colSpan={6} className="muted">
                      No members in this team.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
