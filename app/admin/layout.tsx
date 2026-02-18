import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/team-workforce", label: "Team Workforce" },
  { href: "/admin/teams", label: "Team Management" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/checkpoints", label: "Checkpoints" },
  { href: "/admin/reports", label: "Weekly Reports" },
  { href: "/admin/leaderboard", label: "Leaderboard" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  requireRole("admin");

  return (
    <AppShell title="Admin Control Center" items={adminNav}>
      {children}
    </AppShell>
  );
}
