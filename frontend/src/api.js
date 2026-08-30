export const API_BASE = "http://localhost:4000/api";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

async function sendJSON(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

// --- reads ---
export function fetchProjects() { return getJSON("/projects/full"); }
export function fetchTasks() { return getJSON("/tasks/full"); }
export function fetchUsers() { return getJSON("/users"); }
export function fetchMilestones() { return getJSON("/milestones"); }
export function fetchRisks() { return getJSON("/risks"); }
export function fetchDependencies() { return getJSON("/dependencies"); }
export function fetchUatSit() { return getJSON("/uat_sit"); }
export function fetchGolive() { return getJSON("/golive"); }
export function fetchVendors() { return getJSON("/vendors"); }
export function fetchMeetings() { return getJSON("/meetings"); }
export function fetchKpis() { return getJSON("/kpis"); }
export function fetchAIChat(question, context) {
  return sendJSON("/ai/chat", "POST", { question, context });
}

// --- writes ---
export function updateTaskStatus(id, status) {
  return sendJSON(`/tasks/${id}`, "PUT", { status });
}
export function updateProject(id, fields) {
  return sendJSON(`/projects/${id}`, "PUT", fields);
}
export function createProject(payload) {
  return sendJSON(`/projects`, "POST", payload);
}
export function deleteProject(id) {
  return del(`/projects/${id}`);
}
export function createMeeting(payload) {
  return sendJSON(`/meetings`, "POST", payload);
}
export function deleteMeeting(id) {
  return fetch(`${API_BASE}/meetings/${id}`, { method: "DELETE" }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json();
  });
}