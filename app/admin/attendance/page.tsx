import { Section } from "@/components/section";
import { readDb } from "@/lib/db";
import { AdminAttendanceRecords } from "@/components/admin-attendance-records";

export default async function AttendancePage() {
  const db = await readDb();
  const members = db.users.filter((u) => u.role === "member");

  return (
    <Section
      title="Attendance Records & Matrix"
      subtitle="Comprehensive date-wise and team-wise attendance hub across all teams."
    >
      <AdminAttendanceRecords
        teams={db.teams}
        members={members}
        attendanceRecords={db.attendance}
      />
    </Section>
  );
}
