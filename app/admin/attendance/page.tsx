import { Section } from "@/components/section";
import { markAttendanceAction } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

export default async function AttendancePage() {
  const db = await readDb();
  const members = db.users.filter((u) => u.role === "member" && u.teamId);

  return (
    <>
      <Section
        title="Attendance System"
        subtitle="Mark attendance for each team member by date."
      >
        <form action={markAttendanceAction} className="grid-form single-col">
          <label>
            Date
            <input name="date" type="date" required />
          </label>

          <div className="attendance-sheet">
            {db.teams.map((team) => (
              <div key={team.id} className="attendance-team">
                <div className="team-row">
                  <strong>{team.name}</strong>
                  <label>
                    Quick mode
                    <select name={`mode_${team.id}`} defaultValue="custom">
                      <option value="custom">Custom member selection</option>
                      <option value="present">Mark all present</option>
                      <option value="absent">Mark all absent</option>
                    </select>
                  </label>
                </div>
                <div className="check-grid">
                  {members
                    .filter((m) => m.teamId === team.id)
                    .map((member) => (
                      <label key={member.id} className="check-item">
                        <input type="checkbox" name={`member_${member.id}`} defaultChecked />
                        {member.name}
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <SubmitButton label="Save Attendance" pendingLabel="Saving attendance..." />
        </form>
      </Section>

      <Section title="Recent Records">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Team</th>
                <th>Member</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {db.attendance.slice(0, 20).map((item) => {
                const teamName = db.teams.find((t) => t.id === item.teamId)?.name ?? item.teamId;
                const memberName = db.users.find((u) => u.id === item.memberId)?.name ?? item.memberId;
                return (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{teamName}</td>
                    <td>{memberName}</td>
                    <td>
                      <span className={`badge ${item.present ? "" : "badge-off"}`}>
                        {item.present ? "Present" : "Absent"}
                      </span>
                    </td>
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
