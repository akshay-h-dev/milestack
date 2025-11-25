// ------------------------------------------------------------
// USER
// ------------------------------------------------------------
export type User = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";

  /** Optional avatar */
  avatar?: string;

  /** Calculated on frontend if backend doesn't provide it */
  initials?: string;
};

// ------------------------------------------------------------
// PROJECT
// ------------------------------------------------------------
export type Project = {
  id: string;
  title: string;
  description?: string;
  status: "running" | "paused" | "closed";
};

// ------------------------------------------------------------
// PROJECT MEMBERS
// ------------------------------------------------------------
export type ProjectMember = {
  projectId: string;
  userId: string;
  role: "lead" | "member";
};

// ------------------------------------------------------------
// TASKS
// ------------------------------------------------------------
export type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  projectId: string;   // Added for consistency
};

// ------------------------------------------------------------
// MILESTONES
// ------------------------------------------------------------
export type Milestone = {
  id: string;
  title: string;
  dueDate: string;   // ✔ FINAL correct field
  progress: number;
  description: string;
  projectId: string; // ✔ required — backend always sends this
};

// ------------------------------------------------------------
// CHAT THREADS
// ------------------------------------------------------------
export type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  projectId: string;
};

// ------------------------------------------------------------
// ACTIVITY LOG
// ------------------------------------------------------------
export type Activity = {
  id: string;
  description: string;
  timestamp: string;
  userId: string;
  projectId: string;
};

// ------------------------------------------------------------
// EMPTY INITIAL VALUES (legacy use)
// ------------------------------------------------------------
export const projects: Project[] = [];
export const users: User[] = [];
