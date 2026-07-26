import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWeeklyReport } from "@/lib/queries";
import { buildCorporateReportPdf } from "@/lib/pdf";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const report = await getWeeklyReport();
  const pdf = buildCorporateReportPdf({
    generatedAt: new Date().toLocaleString(),
    mostActiveTeam: report.mostActiveTeam,
    tasksCompleted: report.tasksCompleted,
    attendancePct: report.attendancePct,
    hackathonsParticipated: report.hackathonsParticipated,
    topContributor: report.topContributor,
    teamPerformance: report.teamPerformance,
    memberPerformance: report.memberPerformance
  });

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weekly-report-${new Date().toISOString().slice(0, 10)}.pdf"`
    }
  });
}
