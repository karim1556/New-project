import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const memberNav = [
  { href: "/member", label: "Team Dashboard" },
  { href: "/member/projects", label: "Projects" },
  { href: "/member/daily-logs", label: "Daily Logs" },
  { href: "/member/hackathons", label: "Hackathons" },
  { href: "/member/uploads", label: "File Uploads" },
  { href: "/member/checkpoints", label: "Checkpoints" },
  { href: "/member/announcements", label: "Announcements" },
  { href: "/member/attendance", label: "Attendance" }
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  requireRole("member");
  const current = await getCurrentUser();
  if (!current || !current.isTeamLeader) {
    redirect("/login?error=leader_only");
  }

  return (
    <AppShell title="Team Workspace" items={memberNav}>
      {children}
    </AppShell>
  );
}
