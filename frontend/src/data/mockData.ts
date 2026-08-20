// ---------- Types ----------

export type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "Done";

export interface Person {
  id: string;
  name: string;
  role: string; // e.g. "VAS Engineer", "Team Lead"
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;      // links to Project.id
  assigneeId: string;     // links to Person.id
  status: TaskStatus;
  dueDate: string;        // ISO format "YYYY-MM-DD"
  createdAt: string;      // ISO format "YYYY-MM-DD"
}

// ---------- People ----------
// Replace with real team member names once confirmed by your manager.

export const people: Person[] = [
  { id: "p1", name: "Imane",  role: "Senior VAS Engineer" },
  { id: "p2", name: "Ishak",   role: "Senior VAS Engineer" },
  { id: "p3", name: "Amir",  role: "Senior VAS Engineer" },
  { id: "p4", name: "Nesrine",  role: "VAS Business Manager" },
  { id: "p5", name: "Fatah", role: "Consultant VAS senior" },
  { id: "p6", name: "Ahmed", role: "Consultant VAS Junior" },
  { id: "p7", name: "Islem",  role: "Expert VAS" },
];

// ---------- Projects ----------
// Taken from the real VAS portfolio you shared earlier.

export const projects: Project[] = [
  { id: "pr1", name: "USSD Consolidation" },
  { id: "pr2", name: "Offer on the Fly" },
  { id: "pr3", name: "Commission Centralization Engine" },
  { id: "pr4", name: "Flag V1.1" },
  { id: "pr5", name: "Arcane WP2" },
  { id: "pr6", name: "Multiverse WP4" },
  { id: "pr7", name: "Energy 1.6" },
  { id: "pr8", name: "ATC Loan Phase 2" },
];

// ---------- Tasks ----------
// Sample tasks covering every status, several people, several projects,
// including overdue ones — so both of you can test filtering/sorting/
// highlighting logic against realistic data right away.

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Prepare UAT test cases",
    projectId: "pr1",
    assigneeId: "p1",
    status: "In Progress",
    dueDate: "2026-08-19",
    createdAt: "2026-08-10",
  },
  {
    id: "t2",
    title: "Fix critical defect on offer engine",
    projectId: "pr2",
    assigneeId: "p2",
    status: "Blocked",
    dueDate: "2026-08-15", // overdue on purpose, for testing
    createdAt: "2026-08-05",
  },
  {
    id: "t3",
    title: "Review commission calculation logic",
    projectId: "pr3",
    assigneeId: "p3",
    status: "Not Started",
    dueDate: "2026-08-25",
    createdAt: "2026-08-14",
  },
  {
    id: "t4",
    title: "Vendor follow-up: SIT environment access",
    projectId: "pr4",
    assigneeId: "p4",
    status: "In Progress",
    dueDate: "2026-08-20",
    createdAt: "2026-08-12",
  },
  {
    id: "t5",
    title: "Update rollback plan document",
    projectId: "pr5",
    assigneeId: "p5",
    status: "Not Started",
    dueDate: "2026-08-30",
    createdAt: "2026-08-16",
  },
  {
    id: "t6",
    title: "Deploy to SIT environment",
    projectId: "pr6",
    assigneeId: "p1",
    status: "Done",
    dueDate: "2026-08-14",
    createdAt: "2026-08-01",
  },
  {
    id: "t7",
    title: "Prepare MOP for Go-Live",
    projectId: "pr7",
    assigneeId: "p2",
    status: "In Progress",
    dueDate: "2026-08-22",
    createdAt: "2026-08-11",
  },
  {
    id: "t8",
    title: "Business validation sign-off",
    projectId: "pr8",
    assigneeId: "p4",
    status: "Blocked",
    dueDate: "2026-08-16", // overdue on purpose
    createdAt: "2026-08-03",
  },
  {
    id: "t9",
    title: "Weekly status update to stakeholders",
    projectId: "pr1",
    assigneeId: "p3",
    status: "Not Started",
    dueDate: "2026-08-21",
    createdAt: "2026-08-15",
  },
  {
    id: "t10",
    title: "Resolve open defect list with vendor",
    projectId: "pr4",
    assigneeId: "p5",
    status: "In Progress",
    dueDate: "2026-08-18",
    createdAt: "2026-08-09",
  },
];

// ---------- Helper functions ----------
// Small shared helpers so you both filter/group the same way instead of
// each writing your own (and getting slightly different results).

export function getTasksByPerson(personId: string): Task[] {
  return tasks.filter((t) => t.assigneeId === personId);
}

export function getTasksByProject(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

export function isOverdue(task: Task): boolean {
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today && task.status !== "Done";
}

export function getPersonName(personId: string): string {
  return people.find((p) => p.id === personId)?.name ?? "Unassigned";
}

export function getProjectName(projectId: string): string {
  return projects.find((p) => p.id === projectId)?.name ?? "Unknown project";
}