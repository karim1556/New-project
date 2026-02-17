import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWeeklyReport } from "@/lib/queries";
import { buildSimplePdf } from "@/lib/pdf";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const report = await getWeeklyReport();
  const lines: string[] = [
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Most Active Team: ${report.mostActiveTeam}`,
    `Tasks Completed: ${report.tasksCompleted}`,
    `Attendance: ${report.attendancePct}%`,
    `Hackathons Participated: ${report.hackathonsParticipated}`,
    `Top Contributor: ${report.topContributor}`,
    "",
    "Team Breakdown:",
    ...report.teamPerformance.map(
      (t) => `${t.teamName} | tasks=${t.tasksCompleted} | attendance=${t.attendancePct}% | hackathons=${t.hackathons}`
    ),
    "",
    "Top Member Activity:",
    ...report.memberPerformance.map((m) => `${m.memberName} (${m.teamName}) logs=${m.logsCount}`)
  ];

  const pdf = buildSimplePdf("Weekly Hackathon Club Report", lines);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weekly-report-${new Date().toISOString().slice(0, 10)}.pdf"`
    }
  });
}
