import { getSession } from "@/lib/auth";
import Link from "next/link";

const stats = [
  { value: "25+", label: "Teams" },
  { value: "2.4k", label: "Updates" },
  { value: "< 60s", label: "Reports" },
  { value: "99.2%", label: "Accuracy" },
];

export default function HomePage() {
  const session = getSession();
  const dashboardHref = session
    ? session.role === "admin"
      ? "/admin"
      : "/member"
    : "/login";

  return (
    <div className="lp-root">
      {/* Nav */}
      <nav className="lp-nav">
        <span className="lp-logo">CLUBOS</span>
        <div className="lp-nav-right">
          <Link href="/login" className="lp-ghost">Login</Link>
          <Link href={dashboardHref} className="lp-pill">
            {session ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-noise" />
        <div className="lp-glow lp-glow-1" />
        <div className="lp-glow lp-glow-2" />

        <p className="lp-eyebrow">Hackathon OS</p>
        <h1 className="lp-headline">
          Run your club.<br />
          <em>Like a product team.</em>
        </h1>
        <p className="lp-sub">
          One command center for teams, checkpoints,
          leaderboards &amp; reports.
        </p>

        <div className="lp-ctas">
          <Link href={dashboardHref} className="lp-pill lp-pill-lg">
            {session ? "Open Dashboard" : "Launch platform"}
          </Link>
          <Link href="/login" className="lp-ghost lp-ghost-lg">Sign in</Link>
        </div>

        {/* Stats strip */}
        <div className="lp-stats">
          {stats.map((s) => (
            <div key={s.label} className="lp-stat">
              <span className="lp-stat-val">{s.value}</span>
              <span className="lp-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature trio */}
      <section className="lp-trio">
        <article className="lp-card">
          <span className="lp-card-icon">⌘</span>
          <h3>Command Center</h3>
          <p>Every team, every log, every blocker — one screen.</p>
        </article>
        <article className="lp-card">
          <span className="lp-card-icon">◈</span>
          <h3>Checkpoint Engine</h3>
          <p>Milestones reviewed &amp; approved before points land.</p>
        </article>
        <article className="lp-card">
          <span className="lp-card-icon">↗</span>
          <h3>Instant Reports</h3>
          <p>PDF-ready weekly reports generated in under a minute.</p>
        </article>
      </section>

      {/* Bottom CTA */}
      <section className="lp-bottom">
        <h2>Ready to compete?</h2>
        <Link href={dashboardHref} className="lp-pill lp-pill-lg">
          {session ? "Open Dashboard" : "Get started free"}
        </Link>
      </section>
    </div>
  );
}
