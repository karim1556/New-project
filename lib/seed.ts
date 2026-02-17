import { Database } from "@/lib/types";

export function getDemoDb(): Database {
  return {
    users: [
      {
        id: "u_admin",
        name: "Club Admin",
        email: "admin@club.local",
        password: "admin123",
        role: "admin"
      },
      {
        id: "u_a1",
        name: "Aarav Shah",
        email: "aarav@club.local",
        password: "member123",
        role: "member",
        teamId: "t_alpha",
        isTeamLeader: true
      },
      {
        id: "u_a2",
        name: "Priya Iyer",
        email: "priya@club.local",
        password: "member123",
        role: "member",
        teamId: "t_alpha",
        isTeamLeader: false
      },
      {
        id: "u_b1",
        name: "Rohan Mehta",
        email: "rohan@club.local",
        password: "member123",
        role: "member",
        teamId: "t_beta",
        isTeamLeader: true
      }
    ],
    teams: [
      {
        id: "t_alpha",
        name: "Alpha Builders",
        memberIds: ["u_a1", "u_a2"]
      },
      {
        id: "t_beta",
        name: "Beta Innovators",
        memberIds: ["u_b1"]
      }
    ],
    projects: [
      {
        id: "p_1",
        teamId: "t_alpha",
        title: "Smart Campus Assistant",
        hackathonName: "Build For Bharat",
        description: "AI assistant for college operations.",
        startDate: "2026-02-01",
        deadline: "2026-03-01",
        progress: 45,
        status: "Development"
      }
    ],
    dailyLogs: [
      {
        id: "d_1",
        teamId: "t_alpha",
        memberId: "u_a1",
        date: "2026-02-16",
        projectName: "Smart Campus Assistant",
        taskCompleted: "Built auth screens",
        timeSpentHours: 4,
        progressPercent: 40,
        notes: "Integrated login and role redirects"
      }
    ],
    hackathons: [
      {
        id: "h_1",
        teamId: "t_alpha",
        hackathonName: "Build For Bharat",
        platform: "Devfolio",
        participatingMemberIds: ["u_a1", "u_a2"],
        date: "2026-03-10",
        status: "Registered",
        resultNotes: ""
      }
    ],
    attendance: [
      {
        id: "at_1",
        date: "2026-02-16",
        teamId: "t_alpha",
        memberId: "u_a1",
        present: true
      },
      {
        id: "at_2",
        date: "2026-02-16",
        teamId: "t_alpha",
        memberId: "u_a2",
        present: false
      }
    ],
    announcements: [
      {
        id: "an_1",
        title: "Internal Sprint Review",
        message: "Submit weekly progress by Sunday 8 PM.",
        createdAt: "2026-02-15T10:00:00.000Z",
        createdBy: "u_admin"
      }
    ],
    files: [
      {
        id: "f_1",
        teamId: "t_alpha",
        memberId: "u_a1",
        targetType: "project",
        targetId: "p_1",
        label: "GitHub Repository",
        fileUrl: "https://github.com/example/smart-campus-assistant",
        createdAt: "2026-02-16T15:30:00.000Z"
      }
    ],
    points: [
      {
        id: "pt_1",
        teamId: "t_alpha",
        reason: "Daily activity",
        points: 10,
        createdAt: "2026-02-16T16:00:00.000Z",
        createdBy: "u_admin"
      },
      {
        id: "pt_2",
        teamId: "t_alpha",
        memberId: "u_a1",
        reason: "Hackathon participation",
        points: 20,
        createdAt: "2026-02-16T16:05:00.000Z",
        createdBy: "u_admin"
      }
    ],
    checkpoints: [],
    checkpointSubmissions: []
  };
}
