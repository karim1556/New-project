import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const memberNav = [
  { href: "/member", label: "Team Dashboard" },
  { href: "/member/projects", label: "Projects" },
  { href: "/member/daily-logs", label: "Daily Logs" },
  { href: "/member/hackathons", label: "Hackathons" },
  { href: "/member/uploads", label: "File Uploads" },
  { href: "/member/announcements", label: "Announcements" },
  { href: "/member/attendance", label: "Attendance" }
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  requireRole("member");

  return (
    <AppShell title="Team Workspace" items={memberNav}>
      {children}
    </AppShell>
  );
}
