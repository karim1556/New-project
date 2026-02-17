export type Role = "admin" | "member";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  teamId?: string;
  isTeamLeader?: boolean;
};

export type Team = {
  id: string;
  name: string;
  memberIds: string[];
};

export type ProjectStatus = "Planning" | "Development" | "Testing" | "Submitted" | "Completed";

export type Project = {
  id: string;
  teamId: string;
  title: string;
  hackathonName?: string;
  description: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: ProjectStatus;
};

export type DailyLog = {
  id: string;
  teamId: string;
  memberId: string;
  date: string;
  projectName: string;
  taskCompleted: string;
  timeSpentHours: number;
  progressPercent: number;
  notes: string;
};

export type HackathonStatus = "Registered" | "In progress" | "Submitted" | "Won" | "Lost";

export type HackathonEntry = {
  id: string;
  teamId: string;
  hackathonName: string;
  platform: string;
  participatingMemberIds: string[];
  date: string;
  status: HackathonStatus;
  resultNotes: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  teamId: string;
  memberId: string;
  present: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
};

export type FileAttachment = {
  id: string;
  teamId: string;
  memberId: string;
  targetType: "project" | "hackathon";
  targetId: string;
  label: string;
  fileUrl: string;
  createdAt: string;
};

export type LeaderboardPoint = {
  id: string;
  teamId: string;
  memberId?: string;
  reason: string;
  points: number;
  createdAt: string;
  createdBy?: string;
};

export type CheckpointStatus = "Pending" | "Approved" | "Rejected";

export type TeamCheckpoint = {
  id: string;
  teamId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  createdAt: string;
  createdBy: string;
};

export type CheckpointSubmission = {
  id: string;
  checkpointId: string;
  teamId: string;
  submittedBy: string;
  evidence: string;
  notes: string;
  submittedAt: string;
  status: CheckpointStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  awardedPointId?: string;
};

export type Database = {
  users: User[];
  teams: Team[];
  projects: Project[];
  dailyLogs: DailyLog[];
  hackathons: HackathonEntry[];
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  files: FileAttachment[];
  points: LeaderboardPoint[];
  checkpoints: TeamCheckpoint[];
  checkpointSubmissions: CheckpointSubmission[];
};
