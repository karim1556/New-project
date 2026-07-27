"use client";

import { useState, useMemo } from "react";
import { ClubRegistration } from "@/lib/types";
import { ExportButton } from "@/components/export-button";

interface RegistrationsClientProps {
  initialRegistrations: ClubRegistration[];
}

export function RegistrationsClient({ initialRegistrations }: RegistrationsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  // Filter unique classes and languages for dropdown filter
  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    initialRegistrations.forEach((r) => {
      if (r.class && r.division) classes.add(`${r.class}-${r.division}`);
    });
    return Array.from(classes);
  }, [initialRegistrations]);

  const languageOptions = useMemo(() => {
    const langs = new Set<string>();
    initialRegistrations.forEach((r) => {
      if (r.primaryLanguage) langs.add(r.primaryLanguage);
    });
    return Array.from(langs);
  }, [initialRegistrations]);

  const filteredRegistrations = useMemo(() => {
    return initialRegistrations.filter((reg) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reg.name.toLowerCase().includes(query) ||
        reg.studentId.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone.includes(query) ||
        reg.primaryLanguage.toLowerCase().includes(query);

      const matchesClass =
        selectedClass === "all" || `${reg.class}-${reg.division}` === selectedClass;

      const matchesLanguage =
        selectedLanguage === "all" || reg.primaryLanguage === selectedLanguage;

      return matchesSearch && matchesClass && matchesLanguage;
    });
  }, [initialRegistrations, search, selectedClass, selectedLanguage]);

  return (
    <div className="registrations-container">
      <div className="table-controls-bar">
        <div className="search-filter-group">
          <div className="search-input-wrap">
            <svg
              className="search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, email, or language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-selects">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Classes</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls.replace("-", " ")}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Languages</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="export-action-area">
          <div className="records-count">
            Showing <strong>{filteredRegistrations.length}</strong> of {initialRegistrations.length} candidates
          </div>
          <ExportButton data={filteredRegistrations} />
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="empty-state">
          <p>No candidate records found matching your query.</p>
          {(search || selectedClass !== "all" || selectedLanguage !== "all") && (
            <button
              type="button"
              className="secondary"
              style={{ marginTop: "0.5rem" }}
              onClick={() => {
                setSearch("");
                setSelectedClass("all");
                setSelectedLanguage("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Class / Div</th>
                <th>WhatsApp / Phone</th>
                <th>Email</th>
                <th>Primary Lang</th>
                <th>Coding Level</th>
                <th>Hackathon Exp</th>
                <th>GitHub / Portfolio</th>
                <th>Previous Projects</th>
                <th>Project Idea</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, idx) => (
                <tr key={reg.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{reg.name}</strong>
                  </td>
                  <td>
                    <code>{reg.studentId}</code>
                  </td>
                  <td>
                    <span className="badge">
                      {reg.class} - {reg.division}
                    </span>
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {reg.phone}
                    </a>
                  </td>
                  <td>{reg.email}</td>
                  <td>
                    <span className="pill-tag">{reg.primaryLanguage}</span>
                  </td>
                  <td>
                    <span className="rating-badge">
                      ⚡ Level {reg.codingLevel} / 5
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        reg.hackathonExperience === "Yes"
                          ? "badge badge-success"
                          : "badge"
                      }
                    >
                      {reg.hackathonExperience || "No"}
                    </span>
                  </td>
                  <td>
                    {reg.githubPortfolio ? (
                      <a
                        href={reg.githubPortfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        🔗 Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                    {reg.previousProjects || "-"}
                  </td>
                  <td style={{ maxWidth: "220px", whiteSpace: "normal" }}>
                    {reg.projectIdea || "-"}
                  </td>
                  <td>
                    {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
