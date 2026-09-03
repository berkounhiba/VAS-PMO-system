/* ============================================================
   API LAYER — every fetch call, one place.
============================================================= */

export const API_BASE = "http://localhost:4000/api";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    throw new Error(`${path} returned ${res.status}`);
  }

  return res.json();
}

async function sendJSON(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`${path} returned ${res.status}`);
  }

  // DELETE endpoints can return 204 No Content.
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

async function del(path) {
  return sendJSON(path, "DELETE");
}

// ============================================================
// READS
// ============================================================

export function fetchProjects() {
  return getJSON("/projects/full");
}

export function fetchTasks() {
  return getJSON("/tasks/full");
}

export function fetchUsers() {
  return getJSON("/users");
}

export function fetchMilestones() {
  return getJSON("/milestones");
}

export function fetchRisks() {
  return getJSON("/risks");
}

export function fetchDependencies() {
  return getJSON("/dependencies");
}

export function fetchUatSit() {
  return getJSON("/uat_sit");
}

export function fetchGolive() {
  return getJSON("/golive");
}

export function fetchVendors() {
  return getJSON("/vendors");
}

export function fetchMeetings() {
  return getJSON("/meetings");
}

export function fetchKpis() {
  return getJSON("/kpis");
}

export function fetchWeeklySummaries() {
  return getJSON("/weekly-summaries");
}

// ============================================================
// AUTH
// ============================================================

export async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Invalid session");
  }

  return res.json();
}

// ============================================================
// PROJECT CRUD
// ============================================================

export function createProject(payload) {
  return sendJSON("/projects", "POST", payload);
}

export function updateProject(id, fields) {
  return sendJSON(`/projects/${id}`, "PUT", fields);
}

export function deleteProject(id) {
  return del(`/projects/${id}`);
}

// ============================================================
// TASK CRUD
// ============================================================

export function createTask(payload) {
  return sendJSON("/tasks", "POST", payload);
}

export function updateTask(id, fields) {
  return sendJSON(`/tasks/${id}`, "PUT", fields);
}

export function updateTaskStatus(id, status) {
  return sendJSON(`/tasks/${id}/status`, "PUT", { status });
}

export function deleteTask(id) {
  return del(`/tasks/${id}`);
}

// ============================================================
// MILESTONE CRUD
// ============================================================

export function createMilestone(payload) {
  return sendJSON("/milestones", "POST", payload);
}

export function updateMilestone(id, fields) {
  return sendJSON(`/milestones/${id}`, "PUT", fields);
}

export function deleteMilestone(id) {
  return del(`/milestones/${id}`);
}

// ============================================================
// RISK CRUD
// ============================================================

export function createRisk(payload) {
  return sendJSON("/risks", "POST", payload);
}

export function updateRisk(id, fields) {
  return sendJSON(`/risks/${id}`, "PUT", fields);
}

export function deleteRisk(id) {
  return del(`/risks/${id}`);
}

// ============================================================
// DEPENDENCY CRUD
// ============================================================

export function createDependency(payload) {
  return sendJSON("/dependencies", "POST", payload);
}

export function updateDependency(id, fields) {
  return sendJSON(`/dependencies/${id}`, "PUT", fields);
}

export function deleteDependency(id) {
  return del(`/dependencies/${id}`);
}

// ============================================================
// SIT / UAT CRUD
// ============================================================

export function createUatSit(payload) {
  return sendJSON("/uat_sit", "POST", payload);
}

export function updateUatSit(id, fields) {
  return sendJSON(`/uat_sit/${id}`, "PUT", fields);
}

export function deleteUatSit(id) {
  return del(`/uat_sit/${id}`);
}

// ============================================================
// GO-LIVE CRUD
// ============================================================

export function createGolive(payload) {
  return sendJSON("/golive", "POST", payload);
}

export function updateGolive(id, fields) {
  return sendJSON(`/golive/${id}`, "PUT", fields);
}

export function deleteGolive(id) {
  return del(`/golive/${id}`);
}

// ============================================================
// MEETING CRUD
// ============================================================

export function createMeeting(payload) {
  return sendJSON("/meetings", "POST", payload);
}

export function updateMeeting(id, fields) {
  return sendJSON(`/meetings/${id}`, "PUT", fields);
}

export function deleteMeeting(id) {
  return del(`/meetings/${id}`);
}

// ============================================================
// VENDOR CRUD
// ============================================================

export function createVendor(payload) {
  return sendJSON("/vendors", "POST", payload);
}

export function updateVendor(id, fields) {
  return sendJSON(`/vendors/${id}`, "PUT", fields);
}

export function deleteVendor(id) {
  return del(`/vendors/${id}`);
}

// ============================================================
// WEEKLY SUMMARIES
// ============================================================

export function createWeeklySummary(payload) {
  return sendJSON("/weekly-summaries", "POST", payload);
}

// ============================================================
// AI
// ============================================================

export function fetchAIChat(question, context) {
  return sendJSON("/ai/chat", "POST", {
    question,
    context,
  });
}

export function generateWeeklyReport(context) {
  return sendJSON("/ai/weekly-report", "POST", {
    context,
  });
}

export function summarizeMeetingMinutes(notes) {
  return sendJSON("/ai/meeting-minutes", "POST", {
    notes,
  });
}
