import Link from "next/link";
import { registerClubMemberAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { registered?: string; error?: string };
}) {
  const isRegistered = searchParams?.registered === "true";
  const errorMessage = searchParams?.error;

  return (
    <div className="reg-page-container">
      {/* Background Glow Effects */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />
      <div className="bg-grid-overlay" />

      {/* Top Navigation */}
      <header className="reg-header">
        <Link href="/" className="reg-logo-group">
          <span className="reg-logo-icon">⚡</span>
          <span className="reg-logo-text">HACKATHON CLUB</span>
          <span className="reg-year-badge">2026 BATCH</span>
        </Link>
        <div className="reg-header-right">
          <span className="status-indicator">
            <span className="status-dot" />
            REGISTRATIONS OPEN
          </span>
          <Link href="/login" className="admin-login-ghost">
            Sign In 🔒
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="reg-main-wrapper">
        {isRegistered ? (
          /* THANK YOU CONFIRMATION SCREEN */
          <div className="thankyou-card glass-panel fade-in-up">
            <div className="thankyou-badge-wrap">
              <span className="thankyou-icon">🎉</span>
            </div>
            <h1 className="thankyou-title">Registration Submitted!</h1>
            <p className="thankyou-subtitle">
              Welcome to <strong>Hackathon Club 2026</strong>. Your application has been successfully recorded in our database.
            </p>

            <div className="thankyou-details-box">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-status-pill">APPLICATION RECEIVED</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Next Step</span>
                <span className="detail-val">Check your WhatsApp &amp; Email for upcoming orientation details.</span>
              </div>
            </div>

            {/* TWO CONTACT NUMBERS SECTION */}
            <div className="contacts-section">
              <h3 className="contacts-title">Have questions or need assistance? Contact our team:</h3>
              <div className="contacts-grid">
                <div className="contact-card">
                  <div className="contact-role">Student Incharge</div>
                  <div className="contact-name">Student Incharge</div>
                  <div className="contact-phone">+91 9004667948</div>
                  <a
                    href="https://wa.me/919004667948?text=Hi!%20I%20have%20a%20query%20regarding%20Hackathon%20Club%202026%20registration."
                    target="_blank"
                    rel="noreferrer"
                    className="wa-button"
                  >
                    💬 Chat on WhatsApp
                  </a>
                </div>

                <div className="contact-card">
                  <div className="contact-role">Faculty Incharge</div>
                  <div className="contact-name">Faculty Incharge</div>
                  <div className="contact-phone">+91 72639 31321</div>
                  <a
                    href="https://wa.me/917263931321?text=Hi!%20I%20have%20a%20query%20regarding%20Hackathon%20Club%202026%20registration."
                    target="_blank"
                    rel="noreferrer"
                    className="wa-button wa-button-alt"
                  >
                    💬 Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/" className="admin-login-ghost">
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM SCREEN */
          <div className="reg-card-container fade-in-up">
            <div className="reg-hero-banner">
              <div className="hero-eyebrow">OFFICIAL RECRUITMENT FORM</div>
              <h1 className="hero-title">
                HACKATHON CLUB <span className="hero-gradient-text">2026</span>
              </h1>
              <p className="hero-sub">
                Build real-world projects, compete in nationwide hackathons, and collaborate with top developers on campus.
              </p>
            </div>

            {errorMessage && (
              <div className="error-banner">
                ⚠️ {errorMessage === "fill_all" ? "Please fill in all required fields." : errorMessage}
              </div>
            )}

            <form action={registerClubMemberAction} className="reg-form-body">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="form-section-card glass-card">
                <div className="section-header">
                  <span className="section-num">01</span>
                  <div>
                    <h2 className="section-title">Personal Details</h2>
                    <p className="section-desc">Provide your contact and identification details.</p>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="name" className="field-label">
                    Name of the student <span className="req-star">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Karim Shaikh"
                    className="reg-input"
                  />
                </div>

                <div className="field-grid-2">
                  <div className="field-group">
                    <label htmlFor="studentId" className="field-label">
                      Student ID / Roll No <span className="req-star">*</span>
                    </label>
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      required
                      placeholder="e.g. 2026-CS-042"
                      className="reg-input"
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="phone" className="field-label">
                      Contact number (WhatsApp preferred) <span className="req-star">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      className="reg-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="email" className="field-label">
                    Email address <span className="req-star">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. student@college.edu"
                    className="reg-input"
                  />
                </div>
              </div>

              {/* SECTION 2: ACADEMIC DETAILS */}
              <div className="form-section-card glass-card">
                <div className="section-header">
                  <span className="section-num">02</span>
                  <div>
                    <h2 className="section-title">Academic Information</h2>
                    <p className="section-desc">Select your current class and division.</p>
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="field-group">
                    <label htmlFor="class" className="field-label">
                      Class <span className="req-star">*</span>
                    </label>
                    <select id="class" name="class" required defaultValue="" className="reg-select">
                      <option value="" disabled>
                        Select your class
                      </option>
                      <option value="FE">FE (First Year)</option>
                      <option value="SE">SE (Second Year)</option>
                      <option value="TE">TE (Third Year)</option>
                      <option value="BE">BE (Final Year)</option>
                      <option value="Other">Other / Postgraduate</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label htmlFor="division" className="field-label">
                      Division <span className="req-star">*</span>
                    </label>
                    <input
                      id="division"
                      name="division"
                      type="text"
                      required
                      placeholder="e.g. Div A / B / C"
                      className="reg-input"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TECHNICAL EXPERIENCE */}
              <div className="form-section-card glass-card">
                <div className="section-header">
                  <span className="section-num">03</span>
                  <div>
                    <h2 className="section-title">Experience &amp; Technical Skills</h2>
                    <p className="section-desc">Tell us about your coding skills and background.</p>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="primaryLanguage" className="field-label">
                    Primary programming language <span className="req-star">*</span>
                  </label>
                  <input
                    id="primaryLanguage"
                    name="primaryLanguage"
                    type="text"
                    required
                    placeholder="e.g. Python, C++, Java, JavaScript, Rust"
                    className="reg-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="otherLanguages" className="field-label">
                    Other languages / technologies known
                  </label>
                  <textarea
                    id="otherLanguages"
                    name="otherLanguages"
                    rows={3}
                    placeholder="e.g. React, Next.js, Flutter, Node.js, Docker, AI/ML libraries..."
                    className="reg-textarea"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Self-rating of coding level <span className="req-star">*</span>
                  </label>
                  <p className="rating-help-text">Rate your technical proficiency from 1 (Beginner) to 5 (Advanced)</p>
                  
                  <div className="rating-scale-container">
                    <div className="rating-endpoint">Beginner</div>
                    <div className="rating-options">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <label key={lvl} className="rating-chip">
                          <input
                            type="radio"
                            name="codingLevel"
                            value={lvl}
                            defaultChecked={lvl === 3}
                            className="rating-radio"
                          />
                          <span className="rating-box">
                            <span className="rating-num">{lvl}</span>
                            <span className="rating-lbl">
                              {lvl === 1
                                ? "Novice"
                                : lvl === 2
                                ? "Basic"
                                : lvl === 3
                                ? "Intermediate"
                                : lvl === 4
                                ? "Proficient"
                                : "Advanced"}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="rating-endpoint">Advanced</div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: HACKATHONS, PROJECTS & PORTFOLIO */}
              <div className="form-section-card glass-card">
                <div className="section-header">
                  <span className="section-num">04</span>
                  <div>
                    <h2 className="section-title">Projects, Hackathons &amp; Portfolio</h2>
                    <p className="section-desc">Share your hackathon background, past projects, and GitHub links.</p>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    Have you participated in any hackathon before? <span className="req-star">*</span>
                  </label>
                  <div className="radio-options-row">
                    <label className="radio-chip-option">
                      <input
                        type="radio"
                        name="hackathonExperience"
                        value="Yes"
                        required
                        className="radio-input-custom"
                      />
                      <span className="radio-box-custom">Yes</span>
                    </label>
                    <label className="radio-chip-option">
                      <input
                        type="radio"
                        name="hackathonExperience"
                        value="No"
                        required
                        defaultChecked
                        className="radio-input-custom"
                      />
                      <span className="radio-box-custom">No</span>
                    </label>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="previousProjects" className="field-label">
                    What projects did you build previously? Mention project details.
                  </label>
                  <textarea
                    id="previousProjects"
                    name="previousProjects"
                    rows={3}
                    placeholder="e.g. Web app for student attendance, AI chatbot, mobile game..."
                    className="reg-textarea"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="githubPortfolio" className="field-label">
                    GitHub / portfolio link (if any)
                  </label>
                  <input
                    id="githubPortfolio"
                    name="githubPortfolio"
                    type="url"
                    placeholder="e.g. https://github.com/username or portfolio link"
                    className="reg-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="projectIdea" className="field-label">
                    Do you already have a project idea? Briefly describe your idea (if any) <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="projectIdea"
                    name="projectIdea"
                    rows={3}
                    required
                    placeholder="Briefly describe your project idea or what you want to build during the hackathon..."
                    className="reg-textarea"
                  />
                </div>
              </div>

              {/* FORM SUBMISSION BUTTON */}
              <div className="form-submit-row">
                <SubmitButton
                  className="btn-submit-cyber"
                  label="Submit Registration 🚀"
                  pendingLabel="Submitting Registration..."
                />
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="reg-footer">
        <p>© 2026 Hackathon Club • VPPCOE</p>
      </footer>
    </div>
  );
}
