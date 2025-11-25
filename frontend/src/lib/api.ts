// src/lib/api.ts

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ---------------------------------------------------------
   AUTH HEADERS
--------------------------------------------------------- */
export function getAuthHeaders() {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");
  if (!token) return {}; // no auth

  return { Authorization: `Bearer ${token}` };
}

export function mergeHeaders(
  ...parts: (HeadersInit | Record<string, string> | undefined)[]
) {
  const out: Record<string, string> = {};
  for (const p of parts) {
    if (!p) continue;

    if (p instanceof Headers) {
      p.forEach((v, k) => (out[k] = v));
    } else if (Array.isArray(p)) {
      p.forEach(([k, v]) => (out[k] = v as string));
    } else {
      Object.assign(out, p);
    }
  }
  return out;
}

/* ---------------------------------------------------------
   GENERIC FETCH WRAPPER
--------------------------------------------------------- */
async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || data.message || "API error";
    throw new Error(msg);
  }
  return data;
}

/* ---------------------------------------------------------
   PROJECTS
--------------------------------------------------------- */
export async function fetchProjects() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  return apiFetch(`${API_BASE}/api/projects`, {
    headers: mergeHeaders(getAuthHeaders()),
  });
}

export async function createProject(data: any) {
  return apiFetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: mergeHeaders(
      { "Content-Type": "application/json" },
      getAuthHeaders()
    ),
    body: JSON.stringify(data),
  });
}

export async function updateProject(projectId: string, patch: any) {
  return apiFetch(`${API_BASE}/api/projects/${projectId}`, {
    method: "PUT",
    headers: mergeHeaders(
      { "Content-Type": "application/json" },
      getAuthHeaders()
    ),
    body: JSON.stringify(patch),
  });
}

export async function deleteProject(projectId: string) {
  return apiFetch(`${API_BASE}/api/projects/${projectId}`, {
    method: "DELETE",
    headers: mergeHeaders(getAuthHeaders()),
  });
}

/* ---------------------------------------------------------
   TASKS
--------------------------------------------------------- */
export async function fetchTasks(projectId?: string) {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const url = projectId
    ? `${API_BASE}/api/tasks?projectId=${encodeURIComponent(projectId)}`
    : `${API_BASE}/api/tasks`;

  return apiFetch(url, { headers: mergeHeaders(getAuthHeaders()) });
}

export async function createTask(data: any) {
  return apiFetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(data),
  });
}

export async function updateTask(taskId: string, patch: any) {
  return apiFetch(`${API_BASE}/api/tasks/${taskId}`, {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(patch),
  });
}

export async function deleteTask(taskId: string) {
  return apiFetch(`${API_BASE}/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: mergeHeaders(getAuthHeaders()),
  });
}

/* ---------------------------------------------------------
   MILESTONES
--------------------------------------------------------- */
export async function fetchMilestones(projectId?: string) {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const url = projectId
    ? `${API_BASE}/api/milestones?projectId=${encodeURIComponent(projectId)}`
    : `${API_BASE}/api/milestones`;

  return apiFetch(url, {
    headers: mergeHeaders(getAuthHeaders()),
  });
}

export async function createMilestone(data: {
  title: string;
  description?: string;
  dueDate: string;
  projectId: string;
  status?: string;
}) {
  return apiFetch(`${API_BASE}/api/milestones`, {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(data),
  });
}

export async function updateMilestone(
  milestoneId: string,
  patch: {
    title?: string;
    description?: string;
    dueDate?: string;
    status?: string;
    projectId: string;
    progress?: number;
  }
) {
  return apiFetch(`${API_BASE}/api/milestones/${milestoneId}`, {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(patch),
  });
}

export async function deleteMilestone(milestoneId: string) {
  return apiFetch(`${API_BASE}/api/milestones/${milestoneId}`, {
    method: "DELETE",
    headers: mergeHeaders(getAuthHeaders()),
  });
}

/* ---------------------------------------------------------
   CHAT THREADS
--------------------------------------------------------- */
export async function fetchChatThreads(projectId: string) {
  return apiFetch(
    `${API_BASE}/api/chatThreads?projectId=${encodeURIComponent(projectId)}`,
    { headers: mergeHeaders(getAuthHeaders()) }
  );
}

export async function createChatThread(data: {
  title: string;
  projectId: string;
}) {
  return apiFetch(`${API_BASE}/api/chatThreads`, {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(data),
  });
}

export async function renameChatThread(threadId: string, newTitle: string) {
  return apiFetch(`${API_BASE}/api/chatThreads/${threadId}`, {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify({ title: newTitle }),
  });
}

export async function sendChatMessage(threadId: string, message: {
  text: string;
  senderId: string;
}) {
  return apiFetch(`${API_BASE}/api/chatThreads/${threadId}`, {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify({ message }),
  });
}

export async function updateChatThread(threadId: string, patch: any) {
  return apiFetch(`${API_BASE}/api/chatThreads/${threadId}`, {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders()),
    body: JSON.stringify(patch),
  });
}

export async function deleteChatThread(threadId: string) {
  return apiFetch(`${API_BASE}/api/chatThreads/${threadId}`, {
    method: "DELETE",
    headers: mergeHeaders(getAuthHeaders()),
  });
}

/* ---------------------------------------------------------
   TEAMMATES
--------------------------------------------------------- */
export async function fetchTeammates(projectId: string) {
  return apiFetch(
    `${API_BASE}/api/teammates?projectId=${encodeURIComponent(projectId)}`,
    { headers: mergeHeaders(getAuthHeaders()) }
  );
}

export async function inviteTeammate(data: {
  name?: string;
  email: string;
  projectId: string;
}) {
  return apiFetch(`${API_BASE}/api/invites`, {
    method: "POST",
    headers: mergeHeaders(
      { "Content-Type": "application/json" },
      getAuthHeaders()
    ),
    body: JSON.stringify(data),
  });
}

export async function removeTeammate(userId: string, projectId: string) {
  return apiFetch(
    `${API_BASE}/api/teammates/${userId}?projectId=${encodeURIComponent(projectId)}`,
    {
      method: "DELETE",
      headers: mergeHeaders(getAuthHeaders()),
    }
  );
}

/* ---------------------------------------------------------
   ACTIVITY FEED (NEW)
--------------------------------------------------------- */
export async function fetchActivities(projectId: string) {
  return apiFetch(
    `${API_BASE}/api/activities?projectId=${encodeURIComponent(projectId)}`,
    { headers: mergeHeaders(getAuthHeaders()) }
  );
}

/* ---------------------------------------------------------
   INVITES
--------------------------------------------------------- */
export async function fetchInvites(projectId: string) {
  return apiFetch(
    `${API_BASE}/api/invites?projectId=${encodeURIComponent(projectId)}`,
    { headers: mergeHeaders(getAuthHeaders()) }
  );
}

export async function getInvite(inviteId: string) {
  return apiFetch(`${API_BASE}/api/invites/${inviteId}`);
}

/* ---------------------------------------------------------
   AUTH
--------------------------------------------------------- */
export async function signup(data: {
  name: string;
  email: string;
  password: string;
  inviteId?: string;
}) {
  return apiFetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }) {
  return apiFetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
