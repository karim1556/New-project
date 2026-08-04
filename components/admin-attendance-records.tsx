"use client";

import React, { useState } from "react";
import { markAttendanceAction, toggleMemberAttendanceAction } from "@/lib/actions";

type Team = {
  id: string;
  name: string;
  memberIds: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
  teamId?: string;
  role: string;
};

type AttendanceRecord = {
  id: string;
  date: string;
  teamId: string;
  memberId: string;
  present: boolean;
};

interface AdminAttendanceProps {
  teams: Team[];
  members: User[];
  attendanceRecords: AttendanceRecord[];
}

export function AdminAttendanceRecords({
  teams,
  members,
  attendanceRecords
}: AdminAttendanceProps) {
  const [activeTab, setActiveTab] = useState<"records" | "mark">("records");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit Date State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Extract unique dates sorted newest first
  const uniqueDates = Array.from(new Set(attendanceRecords.map((r) => r.date))).sort(
    (a, b) => (a < b ? 1 : -1)
  );

  // Helper to open Edit mode for a specific date
  const handleEditDateClick = (dateStr: string) => {
    setFormDate(dateStr);
    setActiveTab("mark");
  };

  // Filter records based on selected controls
  let filteredRecords = attendanceRecords;
  if (selectedDateFilter !== "all") {
    filteredRecords = filteredRecords.filter((r) => r.date === selectedDateFilter);
  }
  if (selectedTeamFilter !== "all") {
    filteredRecords = filteredRecords.filter((r) => r.teamId === selectedTeamFilter);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredRecords = filteredRecords.filter((r) => {
      const tName = teams.find((t) => t.id === r.teamId)?.name?.toLowerCase() || "";
      const mName = members.find((m) => m.id === r.memberId)?.name?.toLowerCase() || "";
      return tName.includes(query) || mName.includes(query);
    });
  }

  // Calculate overall metrics
  const totalEntries = filteredRecords.length;
  const totalPresent = filteredRecords.filter((r) => r.present).length;
  const totalAbsent = totalEntries - totalPresent;
  const attendanceRate =
    totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0;

  // Group records by Date -> Team
  const dateGroups: Record<
    string,
    Record<
      string,
      {
        teamName: string;
        presentMembers: { id: string; name: string }[];
        absentMembers: { id: string; name: string }[];
      }
    >
  > = {};

  filteredRecords.forEach((rec) => {
    if (!dateGroups[rec.date]) {
      dateGroups[rec.date] = {};
    }
    if (!dateGroups[rec.date][rec.teamId]) {
      const team = teams.find((t) => t.id === rec.teamId);
      dateGroups[rec.date][rec.teamId] = {
        teamName: team ? team.name : "Unassigned Team",
        presentMembers: [],
        absentMembers: []
      };
    }

    const member = members.find((m) => m.id === rec.memberId);
    const mData = { id: rec.memberId, name: member ? member.name : rec.memberId };

    if (rec.present) {
      dateGroups[rec.date][rec.teamId].presentMembers.push(mData);
    } else {
      dateGroups[rec.date][rec.teamId].absentMembers.push(mData);
    }
  });

  const sortedGroupDates = Object.keys(dateGroups).sort((a, b) => (a < b ? 1 : -1));

  // Map of existing attendance for formDate: memberId -> boolean (present)
  const formDateAttendanceMap: Record<string, boolean> = {};
  attendanceRecords
    .filter((r) => r.date === formDate)
    .forEach((r) => {
      formDateAttendanceMap[r.memberId] = r.present;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header Navigation Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          background: "#ffffff",
          padding: "1rem 1.25rem",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            type="button"
            className={activeTab === "records" ? "primary" : "secondary"}
            onClick={() => setActiveTab("records")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            📅 Date & Team-Wise Matrix
          </button>
          <button
            type="button"
            className={activeTab === "mark" ? "primary" : "secondary"}
            onClick={() => setActiveTab("mark")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            ✏️ Mark / Edit Attendance Sheet
          </button>
        </div>

        {activeTab === "records" && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Date Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Date:</span>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                style={{
                  padding: "0.45rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All Recorded Dates ({uniqueDates.length})</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Team:</span>
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                style={{
                  padding: "0.45rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600
                }}
              >
                <option value="all">All Teams ({teams.length})</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search team or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                width: "180px",
                background: "#ffffff"
              }}
            />
          </div>
        )}
      </div>

      {activeTab === "records" ? (
        <>
          {/* Key Metrics Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem"
            }}
          >
            <div className="panel" style={{ padding: "1.1rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                Total Days Recorded
              </span>
              <strong style={{ fontSize: "1.6rem", color: "#0f172a", marginTop: "0.2rem", display: "block" }}>
                {uniqueDates.length}
              </strong>
            </div>

            <div className="panel" style={{ padding: "1.1rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                Attendance Rate
              </span>
              <strong style={{ fontSize: "1.6rem", color: "#0284c7", marginTop: "0.2rem", display: "block" }}>
                {attendanceRate}%
              </strong>
            </div>

            <div className="panel" style={{ padding: "1.1rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                Present Records
              </span>
              <strong style={{ fontSize: "1.6rem", color: "#16a34a", marginTop: "0.2rem", display: "block" }}>
                🟢 {totalPresent}
              </strong>
            </div>

            <div className="panel" style={{ padding: "1.1rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                Absent Records
              </span>
              <strong style={{ fontSize: "1.6rem", color: "#dc2626", marginTop: "0.2rem", display: "block" }}>
                🔴 {totalAbsent}
              </strong>
            </div>
          </div>

          {/* Date-Wise & Team-Wise Cards Matrix */}
          {sortedGroupDates.length === 0 ? (
            <div className="panel" style={{ padding: "2.5rem", textAlign: "center" }}>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
                No attendance records match the selected filters.
              </p>
            </div>
          ) : (
            sortedGroupDates.map((dateStr) => {
              const teamsForDate = dateGroups[dateStr];
              const dateTeamIds = Object.keys(teamsForDate);

              let datePresentCount = 0;
              let dateTotalCount = 0;

              dateTeamIds.forEach((tId) => {
                datePresentCount += teamsForDate[tId].presentMembers.length;
                dateTotalCount +=
                  teamsForDate[tId].presentMembers.length +
                  teamsForDate[tId].absentMembers.length;
              });

              const datePct =
                dateTotalCount > 0 ? Math.round((datePresentCount / dateTotalCount) * 100) : 0;

              return (
                <div
                  key={dateStr}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #cbd5e1",
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)"
                  }}
                >
                  {/* Date Card Header with Edit Button */}
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          background: "#4f46e5",
                          color: "#ffffff",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "8px",
                          fontWeight: 800,
                          fontSize: "0.88rem"
                        }}
                      >
                        📅 {dateStr}
                      </span>
                      <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                        {dateTeamIds.length} Teams Audited
                      </strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#16a34a",
                          background: "#dcfce7",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "999px",
                          border: "1px solid #86efac"
                        }}
                      >
                        🟢 {datePresentCount} Present
                      </span>

                      {dateTotalCount - datePresentCount > 0 && (
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            border: "1px solid #fca5a5"
                          }}
                        >
                          🔴 {dateTotalCount - datePresentCount} Absent
                        </span>
                      )}

                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: datePct >= 80 ? "#15803d" : datePct >= 50 ? "#d97706" : "#b91c1c"
                        }}
                      >
                        {datePct}% Attendance Rate
                      </span>

                      {/* Edit Date Sheet Button */}
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleEditDateClick(dateStr)}
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          background: "#ffffff",
                          border: "1px solid #4f46e5",
                          color: "#4f46e5",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        ✏️ Edit Date Sheet
                      </button>
                    </div>
                  </div>

                  {/* Teams Grid for this Date */}
                  <div
                    style={{
                      padding: "1.25rem",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "1.1rem",
                      background: "#fafafa"
                    }}
                  >
                    {dateTeamIds.map((tId) => {
                      const tData = teamsForDate[tId];
                      const totalTeamMembers =
                        tData.presentMembers.length + tData.absentMembers.length;
                      const teamPct =
                        totalTeamMembers > 0
                          ? Math.round((tData.presentMembers.length / totalTeamMembers) * 100)
                          : 0;

                      return (
                        <div
                          key={tId}
                          style={{
                            background: "#ffffff",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            padding: "1rem 1.1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)"
                          }}
                        >
                          {/* Team Name Header */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #f1f5f9",
                              paddingBottom: "0.5rem"
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: "#0f172a"
                              }}
                            >
                              🛡️ {tData.teamName}
                            </h4>
                            <span
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.55rem",
                                borderRadius: "6px",
                                background: teamPct === 100 ? "#dcfce7" : "#f1f5f9",
                                color: teamPct === 100 ? "#15803d" : "#475569"
                              }}
                            >
                              {tData.presentMembers.length}/{totalTeamMembers} Present ({teamPct}%)
                            </span>
                          </div>

                          {/* Member Badges with 1-Click Quick Toggle */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                            {tData.presentMembers.map((m) => (
                              <div
                                key={m.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  padding: "0.45rem 0.75rem",
                                  borderRadius: "8px"
                                }}
                              >
                                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#166534" }}>
                                  {m.name}
                                </span>
                                <form action={toggleMemberAttendanceAction} style={{ margin: 0 }}>
                                  <input type="hidden" name="date" value={dateStr} />
                                  <input type="hidden" name="teamId" value={tId} />
                                  <input type="hidden" name="memberId" value={m.id} />
                                  <input type="hidden" name="present" value="false" />
                                  <button
                                    type="submit"
                                    title="Click to toggle status to Absent"
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      color: "#15803d",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: 0
                                    }}
                                  >
                                    🟢 Present ✏️
                                  </button>
                                </form>
                              </div>
                            ))}

                            {tData.absentMembers.map((m) => (
                              <div
                                key={m.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  padding: "0.45rem 0.75rem",
                                  borderRadius: "8px"
                                }}
                              >
                                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#991b1b" }}>
                                  {m.name}
                                </span>
                                <form action={toggleMemberAttendanceAction} style={{ margin: 0 }}>
                                  <input type="hidden" name="date" value={dateStr} />
                                  <input type="hidden" name="teamId" value={tId} />
                                  <input type="hidden" name="memberId" value={m.id} />
                                  <input type="hidden" name="present" value="true" />
                                  <button
                                    type="submit"
                                    title="Click to toggle status to Present"
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      color: "#b91c1c",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: 0
                                    }}
                                  >
                                    🔴 Absent ✏️
                                  </button>
                                </form>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Tabular Comprehensive View */}
          <div className="panel" style={{ marginTop: "1rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              📊 Date & Team Attendance Summary Table
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Team Name</th>
                    <th>Present Count</th>
                    <th>Absent Count</th>
                    <th>Attendance %</th>
                    <th>Present Members</th>
                    <th>Absent Members</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroupDates.map((dateStr) => {
                    const teamsForDate = dateGroups[dateStr];
                    return Object.keys(teamsForDate).map((tId) => {
                      const tData = teamsForDate[tId];
                      const totalM = tData.presentMembers.length + tData.absentMembers.length;
                      const pct = totalM > 0 ? Math.round((tData.presentMembers.length / totalM) * 100) : 0;
                      return (
                        <tr key={`${dateStr}_${tId}`}>
                          <td>
                            <strong>{dateStr}</strong>
                          </td>
                          <td>
                            <strong>{tData.teamName}</strong>
                          </td>
                          <td>
                            <span style={{ color: "#15803d", fontWeight: 700 }}>
                              {tData.presentMembers.length}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: "#b91c1c", fontWeight: 700 }}>
                              {tData.absentMembers.length}
                            </span>
                          </td>
                          <td>
                            <span className="badge">{pct}%</span>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#166534" }}>
                            {tData.presentMembers.map((m) => m.name).join(", ") || "None"}
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#991b1b" }}>
                            {tData.absentMembers.map((m) => m.name).join(", ") || "None"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => handleEditDateClick(dateStr)}
                              style={{ fontSize: "0.74rem", padding: "0.25rem 0.55rem" }}
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Mark & Edit Attendance Form Tab */
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                ✍️ Mark / Edit Attendance Sheet
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Select attendance date to create new or edit existing attendance.
              </p>
            </div>
            {formDate && (
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  border: "1px solid #7dd3fc",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.85rem"
                }}
              >
                ✏️ Editing Date: {formDate}
              </span>
            )}
          </div>

          <form action={markAttendanceAction} className="grid-form single-col">
            <label>
              Select Attendance Date
              <input
                name="date"
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{ maxWidth: "300px", fontWeight: 700 }}
              />
            </label>

            <div className="attendance-sheet">
              {teams.map((team) => (
                <div key={team.id} className="attendance-team">
                  <div className="team-row">
                    <strong>🛡️ {team.name}</strong>
                    <label>
                      Quick mode
                      <select name={`mode_${team.id}`} defaultValue="custom">
                        <option value="custom">Custom member selection</option>
                        <option value="present">Mark all present</option>
                        <option value="absent">Mark all absent</option>
                      </select>
                    </label>
                  </div>
                  <div className="check-grid">
                    {members
                      .filter((m) => m.teamId === team.id)
                      .map((member) => {
                        // Pre-check if present on formDate, default to checked if no record exists for that date yet
                        const isRecorded = Object.prototype.hasOwnProperty.call(
                          formDateAttendanceMap,
                          member.id
                        );
                        const defaultState = isRecorded
                          ? formDateAttendanceMap[member.id]
                          : true;

                        return (
                          <label key={member.id} className="check-item">
                            <input
                              type="checkbox"
                              name={`member_${member.id}`}
                              defaultChecked={defaultState}
                              key={`${formDate}_${member.id}_${defaultState}`}
                            />
                            {member.name}
                          </label>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="submit" className="primary">
                💾 Save Attendance Sheet
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setActiveTab("records")}
              >
                Cancel / Back to Matrix
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
