import Link from "next/link";
import { loginAction } from "@/lib/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="login-wrap">
      <div className="login-grid">
        <section className="login-hero">
          <h1>Hackathon Club Management</h1>
          <p>
            One sleek control hub for teams, attendance, projects, daily execution and hackathon
            outcomes.
          </p>
          <div className="login-points">
            <span>
              <i className="login-dot" /> Team and individual analytics
            </span>
            <span>
              <i className="login-dot" /> Role-based admin and member workspaces
            </span>
            <span>
              <i className="login-dot" /> Daily logs, hackathons, reports and leaderboard
            </span>
          </div>
        </section>

        <section className="login-card">
          <h2>Sign in</h2>
          <p className="muted">Use your club credentials to continue.</p>

          {searchParams.error === "invalid_credentials" ? (
            <p className="login-error">Invalid email or password.</p>
          ) : null}

          {searchParams.error === "leader_only" ? (
            <p className="login-error">
              Only team leader accounts can access the member dashboard.
            </p>
          ) : null}

          <form action={loginAction} className="login-form">
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" required />
            </label>
            <button type="submit">Login</button>
          </form>

          <p className="muted login-note">
            <Link href="/">&larr; Back to home</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
