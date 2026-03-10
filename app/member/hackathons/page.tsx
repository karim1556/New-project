import { Section } from "@/components/section";
import { createHackathonAction, updateHackathonStatusAction } from "@/lib/actions";
import { hackathonStatuses } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";

const STATUS_ORDER = hackathonStatuses;

export default async function HackathonsPage() {
  const current = await getCurrentUser();
  const db = await readDb();

  if (!current || !current.teamId) return null;

  const entries = db.hackathons.filter((h) => h.teamId === current.teamId);

  return (
    <>
      <Section title="Register Hackathon" subtitle="Add a new hackathon your team is participating in.">
        <form action={createHackathonAction} className="grid-form">
          <label className="full-span">
            Hackathon name
            <input name="hackathonName" placeholder="e.g. Smart India Hackathon 2026" required />
          </label>
          <label className="full-span">
            Notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            <textarea name="notes" placeholder="Any extra details, links, or remarks..." />
          </label>
          <SubmitButton label="Register Hackathon" pendingLabel="Registering..." />
        </form>
      </Section>

      <Section title="Hackathon Progress" subtitle="Update the real-time status of each hackathon.">
        {entries.length === 0 ? (
          <p className="muted">No hackathons registered yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {entries.map((entry) => {
              const currentStep = STATUS_ORDER.indexOf(entry.status);
              return (
                <div
                  key={entry.id}
                  style={{
                    background: "var(--card-bg, #111)",
                    border: "1px solid var(--border, #222)",
                    borderRadius: "0.75rem",
                    padding: "1.25rem 1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{entry.hackathonName}</p>
                      <p style={{ margin: "0.25rem 0 0", opacity: 0.5, fontSize: "0.8rem" }}>{entry.date}</p>
                    </div>
                    <span
                      style={{
                        background: entry.status === "Winner" ? "#0e7a3a" : "var(--accent-muted, #1a2a3a)",
                        color: entry.status === "Winner" ? "#7effc0" : "var(--accent, #00d4ff)",
                        borderRadius: "999px",
                        padding: "0.2rem 0.75rem",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {entry.status}
                    </span>
                  </div>

                  {/* Progress steps */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "1.25rem", overflowX: "auto" }}>
                    {STATUS_ORDER.map((step, idx) => {
                      const done = idx <= currentStep;
                      const active = idx === currentStep;
                      return (
                        <div key={step} style={{ display: "flex", alignItems: "center", flex: idx < STATUS_ORDER.length - 1 ? 1 : "none", minWidth: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                            <div
                              style={{
                                width: "1.75rem",
                                height: "1.75rem",
                                borderRadius: "50%",
                                background: done ? (active ? "#00d4ff" : "#0e7a3a") : "var(--border, #222)",
                                border: active ? "2px solid #00d4ff" : "2px solid transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: done ? "#fff" : "var(--muted, #555)",
                                flexShrink: 0,
                              }}
                            >
                              {done && !active ? "✓" : idx + 1}
                            </div>
                            <span
                              style={{
                                fontSize: "0.62rem",
                                whiteSpace: "nowrap",
                                color: done ? (active ? "#00d4ff" : "#7effc0") : "var(--muted, #555)",
                                fontWeight: active ? 700 : 400,
                              }}
                            >
                              {step}
                            </span>
                          </div>
                          {idx < STATUS_ORDER.length - 1 && (
                            <div
                              style={{
                                flex: 1,
                                height: "2px",
                                background: idx < currentStep ? "#0e7a3a" : "var(--border, #222)",
                                margin: "0 0.25rem",
                                marginBottom: "1.1rem",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Update form */}
                  <form action={updateHackathonStatusAction} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <input type="hidden" name="id" value={entry.id} />
                    <label style={{ flex: "0 0 auto" }}>
                      <span style={{ fontSize: "0.78rem", opacity: 0.7, display: "block", marginBottom: "0.25rem" }}>Update status</span>
                      <select name="status" defaultValue={entry.status} style={{ minWidth: "11rem" }}>
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label style={{ flex: 1, minWidth: "12rem" }}>
                      <span style={{ fontSize: "0.78rem", opacity: 0.7, display: "block", marginBottom: "0.25rem" }}>Notes <span style={{ opacity: 0.5 }}>(optional)</span></span>
                      <input name="notes" defaultValue={entry.resultNotes ?? ""} placeholder="Result, links, remarks..." />
                    </label>
                    <SubmitButton label="Update" pendingLabel="Saving..." />
                  </form>

                  {entry.resultNotes && (
                    <p style={{ marginTop: "0.75rem", fontSize: "0.82rem", opacity: 0.6, fontStyle: "italic" }}>
                      {entry.resultNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
