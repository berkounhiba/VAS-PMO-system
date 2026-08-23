// backend/src/db/seeds/seed-tasks.js
//
// Inserts the sample tasks from frontend/src/data/mockData.ts into the
// real database. Matches by NAME (not by p1/pr1 ids), because the real
// database uses random UUIDs, not the short ids mockData.ts uses.
//
// Run with: npm run seed:tasks
// Safe to run once your `users` and `projects` tables already have data
// (they do, from schema.sql).

import { pool } from "../../config/db.js";

// Mirrors frontend/src/data/mockData.ts — if Younes changes names/projects
// there, update this list too so they stay matched.
const peopleNames = {
  p1: "Imane",
  p2: "Ishak",
  p3: "Amir",
  p4: "Nesrine",
  p5: "Fatah",
  p6: "Ahmed",
  p7: "Islem",
};

const projectNames = {
  pr1: "USSD Consolidation",
  pr2: "Offer on the Fly",
  pr3: "Commission Centralization Engine",
  pr4: "Flag V1.1",
  pr5: "Arcane WP2",
  pr6: "Multiverse WP4",
  pr7: "Energy 1.6",
  pr8: "ATC Loan Phase 2",
};

const tasks = [
  { title: "Prepare UAT test cases", project: "pr1", assignee: "p1", status: "In Progress", dueDate: "2026-08-19" },
  { title: "Fix critical defect on offer engine", project: "pr2", assignee: "p2", status: "Blocked", dueDate: "2026-08-15" },
  { title: "Review commission calculation logic", project: "pr3", assignee: "p3", status: "Not Started", dueDate: "2026-08-25" },
  { title: "Vendor follow-up: SIT environment access", project: "pr4", assignee: "p4", status: "In Progress", dueDate: "2026-08-20" },
  { title: "Update rollback plan document", project: "pr5", assignee: "p5", status: "Not Started", dueDate: "2026-08-30" },
  { title: "Deploy to SIT environment", project: "pr6", assignee: "p1", status: "Done", dueDate: "2026-08-14" },
  { title: "Prepare MOP for Go-Live", project: "pr7", assignee: "p2", status: "In Progress", dueDate: "2026-08-22" },
  { title: "Business validation sign-off", project: "pr8", assignee: "p4", status: "Blocked", dueDate: "2026-08-16" },
  { title: "Weekly status update to stakeholders", project: "pr1", assignee: "p3", status: "Not Started", dueDate: "2026-08-21" },
  { title: "Resolve open defect list with vendor", project: "pr4", assignee: "p5", status: "In Progress", dueDate: "2026-08-18" },
];

async function run() {
  // Look up the real UUIDs already in the database, matched by name.
  const { rows: userRows } = await pool.query("SELECT id, name FROM users");
  const { rows: projectRows } = await pool.query("SELECT id, name FROM projects");

  const userIdByName = Object.fromEntries(userRows.map((u) => [u.name, u.id]));
  const projectIdByName = Object.fromEntries(projectRows.map((p) => [p.name, p.id]));

  let inserted = 0;

  for (const t of tasks) {
    const assigneeName = peopleNames[t.assignee];
    const projectName = projectNames[t.project];
    const assigneeId = userIdByName[assigneeName];
    const projectId = projectIdByName[projectName];

    if (!assigneeId || !projectId) {
      console.warn(
        `Skipped "${t.title}" — could not find "${assigneeName}" or "${projectName}" in the database. Check spelling matches exactly.`
      );
      continue;
    }

    await pool.query(
      `INSERT INTO tasks (title, project_id, assignee_id, status, due_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [t.title, projectId, assigneeId, t.status, t.dueDate]
    );
    inserted++;
    console.log(`Inserted: ${t.title}`);
  }

  console.log(`Done. ${inserted}/${tasks.length} tasks inserted.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});