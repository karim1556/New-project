import Link from "next/link";

export default function HomePage() {
  return (
    <div className="lp-root">
      {/* Navigation Header */}
      <nav className="lp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.3rem" }}>⚡</span>
          <span className="lp-logo">HACKATHON CLUB 2026</span>
        </div>

        <div className="lp-nav-right">
          <Link href="/register" className="lp-ghost">
            Apply 2026 🚀
          </Link>
          <Link href="/login" className="lp-pill">
            Sign In 🔒
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-noise" />
        <div className="lp-glow lp-glow-1" />
        <div className="lp-glow lp-glow-2" />

        <div className="lp-eyebrow">OFFICIAL RECRUITMENT &amp; WORKFORCE PORTAL</div>

        <h1 className="lp-headline">
          Build Real Projects. <em>Win Nationwide Hackathons.</em>
        </h1>

        <p className="lp-sub">
          The premier campus ecosystem for student developers, team collaboration, milestone checkpoints, and hackathon leadership.
        </p>

        <div className="lp-ctas">
          <Link href="/register" className="lp-pill lp-pill-lg">
            Apply for 2026 Recruitment 🚀
          </Link>
          <Link href="/login" className="lp-ghost lp-ghost-lg">
            Member &amp; Admin Sign In 🔒
          </Link>
        </div>

        {/* Live Metrics */}
        <div className="lp-stats">
          <div className="lp-stat">
            <span className="lp-stat-val">50+</span>
            <span className="lp-stat-lbl">2026 Candidates</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-val">100%</span>
            <span className="lp-stat-lbl">Project Visibility</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-val">Groq AI</span>
            <span className="lp-stat-lbl">Admin Copilot</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-val">24/7</span>
            <span className="lp-stat-lbl">Sprint Checkpoints</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Trio */}
      <section className="lp-trio">
        <div className="lp-card">
          <span className="lp-card-icon">⚡</span>
          <h3>Groq AI Admin Insights</h3>
          <p>
            Instant AI queries for attendance analytics, daily log tracking, and 1-click executive progress report generation.
          </p>
        </div>

        <div className="lp-card">
          <span className="lp-card-icon">🛠️</span>
          <h3>Sprint &amp; Checkpoint Audits</h3>
          <p>
            Submit proof of work, track daily progress logs, and earn leaderboard points for approved milestone deliverables.
          </p>
        </div>

        <div className="lp-card">
          <span className="lp-card-icon">🏆</span>
          <h3>Hackathon Leadership</h3>
          <p>
            Form balanced teams, track Devfolio hackathons, and accelerate campus talent into nationwide winners.
          </p>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="lp-bottom">
        <h2>Ready to Join the 2026 Cohort?</h2>
        <p style={{ color: "#64748b", maxWidth: "540px", fontSize: "1.05rem" }}>
          Submit your recruitment application today or contact our student and faculty incharges for any queries.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="https://wa.me/919004667948?text=Hi!%20I%20have%20a%20query%20regarding%20Hackathon%20Club%202026."
            target="_blank"
            rel="noreferrer"
            className="lp-ghost"
            style={{ padding: "0.75rem 1.4rem", fontSize: "0.95rem" }}
          >
            💬 Student Incharge (+91 9004667948)
          </a>
          <a
            href="https://wa.me/917263931321?text=Hi!%20I%20have%20a%20query%20regarding%20Hackathon%20Club%202026."
            target="_blank"
            rel="noreferrer"
            className="lp-ghost"
            style={{ padding: "0.75rem 1.4rem", fontSize: "0.95rem" }}
          >
            💬 Faculty Incharge (+91 72639 31321)
          </a>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Link href="/register" className="lp-pill lp-pill-lg">
            Complete Student Registration Form 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "1.5rem 2rem",
          textAlign: "center",
          fontSize: "0.86rem",
          color: "#64748b",
          background: "#ffffff"
        }}
      >
        <p>© 2026 Hackathon Club • VPPCOE. All rights reserved.</p>
      </footer>
    </div>
  );
}
