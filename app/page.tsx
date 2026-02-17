import { getSession } from "@/lib/auth";
import Link from "next/link";

const metrics = [
  { label: "Teams Managed", value: "25+" },
  { label: "Weekly Updates", value: "2.4k" },
  { label: "Report Turnaround", value: "< 60s" },
  { label: "Admin Accuracy", value: "99.2%" }
];

const pillars = [
  {
    title: "Ops Command",
    copy: "Admin sees every team, every project, every blocker, and every submission in one control surface."
  },
  {
    title: "Execution Rhythm",
    copy: "Daily logs and continuous project updates enforce consistency, not last-minute status dumping."
  },
  {
    title: "Checkpoint Governance",
    copy: "Milestones are reviewed and approved before points are awarded, so competition stays credible."
  },
  {
    title: "Communication Priority",
    copy: "Critical announcements are highlighted first, then reminders, then routine notices."
  }
];

const steps = [
  "Admin creates teams and assigns one leader login per team.",
  "Leaders update project progress daily or twice weekly.",
  "Members add logs; admin tracks momentum across teams.",
  "Teams submit checkpoints; admin reviews and awards points.",
  "Weekly report exports to PDF for committee and audits."
];

const faqs = [
  {
    q: "Can we run this without separate frontend/backend?",
    a: "Yes. It runs as one Next.js project with server actions and a single deployment flow."
  },
  {
    q: "Is scoring random?",
    a: "No. Points are admin-assigned or checkpoint-approved through explicit review actions."
  },
  {
    q: "Can teams update projects continuously?",
    a: "Yes. Projects are created once, then progress and status are updated on a cadence."
  }
];

export default function HomePage() {
  const session = getSession();
  const dashboardHref = session ? (session.role === "admin" ? "/admin" : "/member") : "/login";

  return (
    <div className="landing-wrap">
      <header className="landing-nav">
        <p className="landing-brand">CLUBOS</p>
        <div className="landing-nav-actions">
          <Link href="/login" className="landing-link">
            Login
          </Link>
          <Link href={dashboardHref} className="landing-cta">
            {session ? "Open Dashboard" : "Start Now"}
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">Hackathon Club Operating System</p>
          <h1>Build a championship culture, not a spreadsheet process.</h1>
          <p className="landing-sub">
            One premium internal platform for team leadership, execution tracking, checkpoint governance,
            announcement control, and review-ready weekly reporting.
          </p>
          <div className="landing-actions">
            <Link href={dashboardHref} className="landing-cta">
              {session ? "Continue" : "Launch Platform"}
            </Link>
            <Link href="/login" className="landing-link">
              Use Demo Login
            </Link>
          </div>
        </div>

        <div className="landing-orb-grid">
          <article className="hero-card hero-card-large">
            <p>Control Center</p>
            <h3>Admin-grade oversight with team-level velocity and attendance intelligence.</h3>
          </article>
          <article className="hero-card">
            <p>Live Projects</p>
            <h3>Continuous update cadence with freshness signals and stale warnings.</h3>
          </article>
          <article className="hero-card">
            <p>Review Engine</p>
            <h3>Checkpoint approvals before points keep leaderboards credible.</h3>
          </article>
        </div>
      </section>

      <section className="landing-metrics">
        {metrics.map((item) => (
          <article key={item.label} className="metric-card">
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="landing-story">
        <div className="story-head">
          <p className="landing-kicker">Why Teams Switch</p>
          <h2>From fragmented tracking to one disciplined system.</h2>
        </div>
        <div className="story-grid">
          {pillars.map((item) => (
            <article key={item.title} className="story-card">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-flow">
        <div className="story-head">
          <p className="landing-kicker">Execution Flow</p>
          <h2>Built for weekly momentum and measurable progress.</h2>
        </div>
        <ol className="flow-list">
          {steps.map((step) => (
            <li key={step} className="flow-item">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-proofs">
        <article className="proof-panel">
          <p className="landing-kicker">Weekly Review Ready</p>
          <h3>Detailed reports and PDF export in one click.</h3>
          <p>
            Team performance, member activity, attendance trends, and hackathon participation compiled
            into structured review artifacts.
          </p>
        </article>
        <article className="proof-panel">
          <p className="landing-kicker">Communication Control</p>
          <h3>Critical announcements never get buried.</h3>
          <p>
            Priority-aware announcement lanes ensure action items stay visible and teams respond on time.
          </p>
        </article>
      </section>

      <section className="landing-faq">
        <div className="story-head">
          <p className="landing-kicker">FAQ</p>
          <h2>Everything needed to start today.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((item) => (
            <article key={item.q} className="faq-card">
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-bottom-cta">
        <h2>Ready to run your club like a high-performing product team?</h2>
        <p>Start with admin control, leader accountability, and execution transparency.</p>
        <div className="landing-actions">
          <Link href={dashboardHref} className="landing-cta">
            {session ? "Open Dashboard" : "Get Started"}
          </Link>
          <Link href="/login" className="landing-link">
            Login with Demo
          </Link>
        </div>
      </section>
    </div>
  );
}
