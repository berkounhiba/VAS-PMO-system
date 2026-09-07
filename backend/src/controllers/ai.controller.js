import { pool } from "../config/db.js";
import pg from "pg";

// Separate connection using a database role that can ONLY SELECT —
// enforced by Postgres itself, not just application code. This is
// what makes the free-form SQL tool below safe to expose to the AI.
const readonlyPool = process.env.AI_READONLY_DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.AI_READONLY_DATABASE_URL,
      statement_timeout: 5000, // kill any query that runs over 5s
    })
  : null;

const KNOWN_TABLES = [
  "projects", "tasks", "users", "milestones", "risks", "dependencies",
  "uat_sit", "golive", "vendors", "meetings", "weekly_meeting_summaries",
  "kpis", "business_project_details", "it_project_details",
];

function isSafeReadOnlySql(sql) {
  const trimmed = sql.trim().replace(/;\s*$/, "");
  if (!/^\s*(SELECT|WITH)\b/i.test(trimmed)) return "Query must start with SELECT or WITH.";
  if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|EXEC|CALL|COPY|VACUUM|SET|RESET|password_hash)\b/i.test(trimmed)) {
    return "Query contains a disallowed keyword or column.";
  }
  if (trimmed.includes(";")) return "Only a single statement is allowed.";
  return null;
}

async function queryDatabase({ sql } = {}) {
  if (!readonlyPool) {
    return { error: "AI_READONLY_DATABASE_URL is not configured on the backend." };
  }
  if (!sql) return { error: "sql is required" };

  const problem = isSafeReadOnlySql(sql);
  if (problem) return { error: `Rejected: ${problem}` };

  // Auto-cap unbounded queries so a broad question can't return huge rowsets.
  const capped = /\bLIMIT\b/i.test(sql) ? sql : `${sql.trim().replace(/;\s*$/, "")} LIMIT 200`;

  try {
    const result = await readonlyPool.query(capped);
    return { rows: result.rows };
  } catch (err) {
    return { error: `Query failed: ${err.message}` };
  }
}

const SCHEMA_DESCRIPTION = `
Tables and columns you can query (schema is fixed, don't guess other names):
- projects(id, name, domain, business, lead_id, priority, status, phase, progress, planned_start, delay_days, health, blocker, next_action, escalation, remarks, planned_go_live, forecast_go_live, project_type)
- tasks(id, title, project_id, assignee_id, status, due_date, created_at, priority, start_date, progress, dependency, comments)
- users(id, name, role, skills, capacity_pct, allocated_pct, is_manager, access_level)
- milestones(id, project_id, title, due_date, status, owner_id, forecast_date)
- risks(id, project_id, description, severity, status, probability, impact, score, mitigation, owner_id)
- dependencies(id, project_id, depends_on, critical, owner_id, status, target_date)
- uat_sit(id, project_id, module, sit_pct, uat_pct, open_defects, critical_defects, ready)
- golive(id, project_id, rfc, mop, rollback, monitoring, business_signoff, technical_signoff, ready)
- vendors(id, vendor_name, project_id, pending_action, owner_id, sent_date, due_date, days_open, status)
- meetings(id, meeting_date, project_id, topic, decision, action, owner_id, due_date, status, meeting_time)
- weekly_meeting_summaries(id, meeting_date, summary, author_id, created_at)
- kpis(id, month, otd_pct, avg_delay, ftr_pct, uat_pass_pct, vendor_sla_pct)
- business_project_details(project_id, business_requester, phase)
- it_project_details(project_id, vendor, cycle_weeks, phase)
All foreign keys named *_id reference the matching table's id (e.g. assignee_id -> users.id, project_id -> projects.id).
The users table's password_hash column is never accessible — don't attempt to select it.
`.trim();



/* ============================================================
   WHITELISTED DB TOOLS
   The AI can only ever call these — never raw SQL. Each one is a
   safe, read-only, parameterized query. Add more here as needed.
============================================================= */

async function getUserTaskCompletion({ days = 30 } = {}) {
  // NOTE: tasks has no completed_at column, so this is approximated
  // via due_date on Done tasks. Add a completed_at timestamp (set
  // when status -> 'Done') for exact accuracy.
  // LEFT JOIN from users so people with ZERO completed tasks still
  // show up — needed for "who did the least" questions.
  const result = await pool.query(
    `SELECT u.name,
            COUNT(t.id) FILTER (
              WHERE t.status = 'Done' AND t.due_date >= CURRENT_DATE - ($1 || ' days')::interval
            ) AS completed_tasks
     FROM users u
     LEFT JOIN tasks t ON t.assignee_id = u.id
     GROUP BY u.id, u.name
     ORDER BY completed_tasks DESC`,
    [days]
  );
  return result.rows;
}

async function getDelayAnalysis({ projectNames } = {}) {
  // Pulls together everything that could explain why a project is
  // late: its own blocker field, open risks, overdue tasks, and
  // critical/blocked dependencies — in one call, so the model can
  // reason about root causes instead of guessing.
  const nameFilter = Array.isArray(projectNames) && projectNames.length > 0 ? projectNames : null;

  const projectsResult = await pool.query(
    `SELECT id, name, status, delay_days, blocker, next_action, health
     FROM projects
     WHERE ($1::text[] IS NULL OR name = ANY($1))
       AND (delay_days > 0 OR status IN ('Delayed', 'Blocked') OR $1::text[] IS NOT NULL)
     ORDER BY delay_days DESC NULLS LAST`,
    [nameFilter]
  );

  const projects = projectsResult.rows;
  if (projects.length === 0) return { projects: [] };

  const ids = projects.map((p) => p.id);

  const [risksResult, tasksResult, depsResult] = await Promise.all([
    pool.query(
      `SELECT project_id, description, severity, score
       FROM risks WHERE project_id = ANY($1) AND status != 'Closed'
       ORDER BY score DESC NULLS LAST`,
      [ids]
    ),
    pool.query(
      `SELECT project_id, title, status, due_date
       FROM tasks WHERE project_id = ANY($1) AND status != 'Done' AND due_date < CURRENT_DATE`,
      [ids]
    ),
    pool.query(
      `SELECT project_id, depends_on, critical, status
       FROM dependencies WHERE project_id = ANY($1) AND status != 'Resolved'`,
      [ids]
    ),
  ]);

  return {
    projects: projects.map((p) => ({
      ...p,
      open_risks: risksResult.rows.filter((r) => r.project_id === p.id),
      overdue_tasks: tasksResult.rows.filter((t) => t.project_id === p.id),
      unresolved_dependencies: depsResult.rows.filter((d) => d.project_id === p.id),
    })),
  };
}

async function getOverdueTasksByUser() {
  const result = await pool.query(
    `SELECT u.name, COUNT(t.id) AS overdue_count
     FROM tasks t
     JOIN users u ON u.id = t.assignee_id
     WHERE t.status != 'Done' AND t.due_date < CURRENT_DATE
     GROUP BY u.id, u.name
     ORDER BY overdue_count DESC`
  );
  return result.rows;
}

async function getActiveTasksByProject({ projectName } = {}) {
  if (!projectName) {
    return { error: "projectName is required" };
  }
  const result = await pool.query(
    `SELECT p.name AS project, t.title, u.name AS assignee, t.status, t.due_date, t.priority
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE p.name ILIKE '%' || $1 || '%'
       AND t.status != 'Done'
     ORDER BY t.due_date NULLS LAST`,
    [projectName]
  );
  return result.rows;
}

async function getUserWorkload() {
  const result = await pool.query(
    `SELECT u.name, u.capacity_pct, u.allocated_pct,
            COUNT(t.id) FILTER (WHERE t.status != 'Done') AS open_tasks
     FROM users u
     LEFT JOIN tasks t ON t.assignee_id = u.id
     GROUP BY u.id, u.name, u.capacity_pct, u.allocated_pct
     ORDER BY u.allocated_pct DESC`
  );
  return result.rows;
}

async function getProjectRisksSummary({ projectName } = {}) {
  const result = await pool.query(
    `SELECT p.name AS project, r.description, r.severity, r.score, r.status
     FROM risks r
     JOIN projects p ON p.id = r.project_id
     WHERE ($1::text IS NULL OR p.name ILIKE '%' || $1 || '%')
       AND r.status != 'Closed'
     ORDER BY r.score DESC NULLS LAST
     LIMIT 15`,
    [projectName || null]
  );
  return result.rows;
}

const TOOLS = {
  query_database: {
    fn: queryDatabase,
    schema: {
      type: "function",
      function: {
        name: "query_database",
        description: `Run a read-only SQL SELECT query against the live database to answer ANY question that needs real data — names, counts, dates, filters, joins across tables, anything. Prefer this over guessing, and prefer it over the other narrower tools unless one of them fits exactly. Results are capped at 200 rows. Only SELECT/WITH is allowed; no writes.\n\n${SCHEMA_DESCRIPTION}`,
        parameters: {
          type: "object",
          properties: {
            sql: { type: "string", description: "A single read-only PostgreSQL SELECT statement." },
          },
          required: ["sql"],
        },
      },
    },
  },
  get_user_task_completion: {
    fn: getUserTaskCompletion,
    schema: {
      type: "function",
      function: {
        name: "get_user_task_completion",
        description: "Get EVERY user's completed-task count for a recent time window, sorted from most to least. Use this for ANY question about who worked the most, least, hardest, or was most/least productive — the list includes everyone, so read from the top for 'most' and the bottom for 'least'.",
        parameters: {
          type: "object",
          properties: {
            days: { type: "integer", description: "How many days back to look. Default 30. Use 7 for 'last week'." },
          },
        },
      },
    },
  },
  get_delay_analysis: {
    fn: getDelayAnalysis,
    schema: {
      type: "function",
      function: {
        name: "get_delay_analysis",
        description: "Get the root-cause breakdown for why one or more projects are late: their blocker field, open risks, overdue tasks, and unresolved/critical dependencies, all in one call. Use this for ANY question about why a project (or several) is delayed, blocked, or behind schedule.",
        parameters: {
          type: "object",
          properties: {
            projectNames: {
              type: "array",
              items: { type: "string" },
              description: "Optional. Exact project names to analyze. Omit to get all currently delayed/blocked projects.",
            },
          },
        },
      },
    },
  },
  get_active_tasks_by_project: {
    fn: getActiveTasksByProject,
    schema: {
      type: "function",
      function: {
        name: "get_active_tasks_by_project",
        description: "Get everyone currently assigned an active (not-Done) task on a specific project, with the task title, status, priority, and due date. Use this for ANY question about who is working on a named project right now.",
        parameters: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "The project name (or part of it) to filter by, e.g. 'Arcane'." },
          },
          required: ["projectName"],
        },
      },
    },
  },
  get_overdue_tasks_by_user: {
    fn: getOverdueTasksByUser,
    schema: {
      type: "function",
      function: {
        name: "get_overdue_tasks_by_user",
        description: "Get a count of overdue (past due, not Done) tasks grouped by assignee. Use for questions about who is behind or has the most overdue work.",
        parameters: { type: "object", properties: {} },
      },
    },
  },
  get_user_workload: {
    fn: getUserWorkload,
    schema: {
      type: "function",
      function: {
        name: "get_user_workload",
        description: "Get each user's capacity, current allocation percentage, and open task count. Use for questions about who is overloaded or has spare capacity.",
        parameters: { type: "object", properties: {} },
      },
    },
  },
  get_project_risks_summary: {
    fn: getProjectRisksSummary,
    schema: {
      type: "function",
      function: {
        name: "get_project_risks_summary",
        description: "Get open risks, optionally filtered to a specific project by name.",
        parameters: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Optional. Filter to a project whose name contains this text." },
          },
        },
      },
    },
  },
};

async function runTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) {
    return { error: `Unknown tool: ${name}` };
  }
  try {
    const rows = await tool.fn(args || {});
    return { rows };
  } catch (err) {
    console.error(`Tool ${name} failed:`, err.message);
    return { error: `Query failed: ${err.message}` };
  }
}

/* ============================================================
   PROMPT BUILDER — static portfolio context, sent alongside
   every request regardless of which tool (if any) gets called
============================================================= */
function buildSystemPrompt() {
  return `You are the VAS AI Operations Assistant — a sharp, direct telecom PMO analyst who talks like a real colleague, not a textbook.

Rules:
- Be direct and conversational. No rigid sections. No "Answer:", "Evidence:", "Recommendation:" headers.
- If you cite data, weave it naturally into sentences: "Arcane WP2 is 42 days late because of the security audit blocker" — not bullet points.
- If a tool call fails, say so plainly: "I couldn't pull that data right now."
- NEVER invent names, numbers, or project details. Only use data you actually received from tool calls.
- Keep it under 200 words. One or two short paragraphs max.
- Tone: professional but casual. Like a senior PMO lead giving you a quick briefing in the hallway.
- If asking about workload or who worked hardest, use the database tools — don't guess.`;
}

/* ============================================================
   SMART FALLBACK — works instantly without any API key.
   Now also hits the DB directly for a few high-value questions,
   so the "who worked hardest" style queries work even without
   a working Groq key.
============================================================= */
async function generateFallbackResponse(question, context) {
  const q = question.toLowerCase();
  const { projects, risks, tasks, vendors, currentUser } = context;

  const wantsLeast = q.includes("least") || q.includes("worst performer") || q.includes("didn't work") || q.includes("didnt work") || q.includes("not working");
  const wantsMost = q.includes("hardest") || q.includes("most tasks") || q.includes("top performer") || q.includes("best performer") || q.includes("finished the most") || q.includes("working the most") || q.includes("works the most") || q.includes("most active") || q.includes("hardest working") || q.includes("who's working") || q.includes("who is working");

  if (wantsLeast || wantsMost) {
    try {
      const days = q.includes("last week") || q.includes("this week") ? 7 : 30;
      const rows = await getUserTaskCompletion({ days });
      const ranked = wantsLeast ? [...rows].reverse() : rows;
      const top5 = ranked.slice(0, 5);
      const label = wantsLeast ? "the fewest" : "the most";
      return `Here's who completed ${label} tasks in the last ${days} days:\n\n${top5.map((r, i) => `${i + 1}. ${r.name} — ${r.completed_tasks} tasks`).join("\n")}\n\n${wantsLeast ? "Might be worth checking if they're blocked or overloaded." : `Nice work from ${top5[0]?.name} this cycle.`}\n\n_(Based on task due dates — the DB doesn't track exact completion timestamps yet.)_`;
    } catch (err) {
      console.error("Fallback DB query failed:", err.message);
    }
  }

  if (q.includes("overloaded") || q.includes("capacity") || (q.includes("who") && q.includes("busy"))) {
    try {
      const rows = await getUserWorkload();
      const overloaded = rows.filter((r) => Number(r.allocated_pct) >= 0.9);
      return `${overloaded.length} people are at or above 90% allocation right now:\n\n${overloaded.map((r) => `- ${r.name}: ${Math.round(r.allocated_pct * 100)}% allocated, ${r.open_tasks} open tasks`).join("\n") || "Actually, no one is overloaded at the moment."}\n\nIf anyone's swamped, consider shifting tasks to teammates with spare capacity.`;
    } catch (err) {
      console.error("Fallback DB query failed:", err.message);
    }
  }

  if (q.includes("morning brief") || q.includes("my day") || q.includes("priorities") || q.includes("today")) {
    const myOverdue = tasks.filter(
      (t) => t.owner === currentUser && new Date(t.finish) < new Date() && t.status !== "Done"
    );
    const delayed = projects.filter((p) => p.delayDays > 0).slice(0, 3);
    return `Good morning ${currentUser}! Here's what's on your plate:\n\n${myOverdue.length > 0 ? `You've got ${myOverdue.length} overdue task(s): ${myOverdue.map((t) => t.task).join(", ")}. Knock those out first.` : "No overdue tasks — you're clear on that front."}\n\n${delayed.length > 0 ? `Top delayed projects to watch: ${delayed.map((p) => `${p.name} (${p.delayDays}d late)`).join(", ")}.` : "No major delays right now."}\n\n${risks.filter((r) => r.score >= 9).length} high-severity risk(s) are still open. Might want to scan those after you clear your tasks.`;
  }

  if (q.includes("delay") || q.includes("late") || q.includes("blocking") || q.includes("blocked") || q.includes("behind")) {
    try {
      const { projects: analyzed } = await getDelayAnalysis({});
      if (analyzed.length === 0) return `No projects are delayed right now. Portfolio looks clean.`;

      const lines = analyzed.slice(0, 3).map((p) => {
        const reasons = [];
        if (p.blocker) reasons.push(`blocker: "${p.blocker}"`);
        if (p.open_risks.length) reasons.push(`${p.open_risks.length} open risk(s)`);
        if (p.overdue_tasks.length) reasons.push(`${p.overdue_tasks.length} overdue task(s)`);
        if (p.unresolved_dependencies.length) reasons.push(`${p.unresolved_dependencies.length} unresolved dependency(ies)`);
        const causeText = reasons.length ? reasons.join("; ") : "no specific cause logged";
        return `${p.name} is ${p.delay_days ?? 0} days late — ${causeText}`;
      });

      return `${analyzed.length} project(s) are currently delayed:\n\n${lines.join("\n")}\n\nI'd start with ${analyzed[0].name} since it has the longest delay.`;
    } catch (err) {
      console.error("Fallback DB query failed:", err.message);
    }
  }

  if (q.includes("risk")) {
    const topRisks = risks.filter((r) => r.status === "Open").sort((a, b) => b.score - a.score).slice(0, 5);
    return `${risks.filter((r) => r.status === "Open").length} risks are open right now. The top ones:\n\n${topRisks.map((r) => `- ${r.project}: ${r.risk} (score ${r.score})`).join("\n")}\n\nAnything scoring 9+ needs attention ASAP: ${topRisks.filter((r) => r.score >= 9).map((r) => r.project).join(", ") || "nothing critical at the moment"}.`;
  }

  if (q.includes("vendor") || q.includes("overdue") || q.includes("supplier")) {
    const overdue = vendors.filter((v) => v.status === "Overdue");
    return `${overdue.length} vendor action(s) are overdue:\n\n${overdue.map((v) => `- ${v.vendor} (${v.project}): ${v.action} — ${v.daysOpen} days open, owner: ${v.owner}`).join("\n") || "Actually, everything looks clean on the vendor side."}\n\n${overdue.length > 0 ? "I'd follow up on these today if I were you." : ""}`;
  }

  if (q.includes("go-live") || q.includes("golive") || q.includes("ready") || q.includes("deploy")) {
    const ready = projects.filter((p) => p.health === "Green" && p.delayDays === 0);
    const blocked = projects.filter((p) => p.status === "Blocked" || p.status === "Delayed");
    return `${ready.length} project(s) are healthy and on track for Go-Live.\n\n${blocked.length > 0 ? `But ${blocked.map((p) => p.name).join(", ")} are blocked/delayed — sort those out first before any deployment.` : "Nothing blocked right now."}`;
  }

  return `I looked into "${question}" but I don't have a specific briefing for that yet. Here's the quick snapshot:\n\n- ${projects.length} projects in the portfolio\n- ${risks.filter((r) => r.status === "Open").length} open risks\n- ${vendors.filter((v) => v.status === "Overdue").length} overdue vendor actions\n- ${tasks.filter((t) => t.owner === currentUser && t.status !== "Done").length} pending tasks for you\n\nTry asking about delays, risks, vendors, workload, or your morning brief.`;
}

async function callGroqSimple(systemPrompt, userPrompt, maxTokens = 600) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY in environment");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/* ============================================================
   VENDOR EMAIL DRAFTING
   Not yet wired into Vendors.jsx (which still builds its draft
   locally as a template string) — this exists so that page can
   be upgraded to a real AI draft later without a backend change.
============================================================= */
export async function draftVendorEmail(req, res) {
  const { vendor, project, action, due, daysOpen, owner } = req.body;

  if (!vendor || !action) {
    return res.status(400).json({ error: "vendor and action are required" });
  }

  const fallbackDraft = `Subject: Follow-up — ${action} (${project || "project"})

Hi ${vendor} team,

This is a follow-up on the pending action "${action}" for ${project || "the project"}, originally due ${due || "N/A"}. This item has now been open for ${daysOpen ?? "several"} days and is affecting the project's delivery timeline.

Could you please provide an updated status or completion date by end of day tomorrow?

Thanks,
${owner || "The VAS Team"}`;

  try {
    const draft = await callGroqSimple(
      "You draft short, professional vendor follow-up emails for a telecom PMO. Be firm but polite. Output only the email (with a Subject line), no preamble or commentary.",
      `Draft a follow-up email to vendor "${vendor}" about the pending action "${action}" for project "${project || "N/A"}". It was due ${due || "N/A"} and has been open for ${daysOpen ?? "several"} days. Sign off as "${owner || "The VAS Team"}".`,
      400
    );
    res.json({ draft, source: "groq-cloud" });
  } catch (err) {
    console.warn("Groq failed for vendor draft, using template fallback:", err.message);
    res.json({ draft: fallbackDraft, source: "fallback" });
  }
}

/* ============================================================
   WEEKLY REPORT GENERATION
============================================================= */
export async function generateWeeklyReport(req, res) {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: "context is required" });
  }

  const fallbackReport = `**Weekly Portfolio Report**

- Projects tracked: ${context.projects?.length ?? "N/A"}
- Open risks: ${context.risks?.filter((r) => r.status === "Open").length ?? "N/A"}
- Overdue vendor actions: ${context.vendors?.filter((v) => v.status === "Overdue").length ?? "N/A"}

_Cloud LLM unavailable — this is a basic auto-generated summary. Try again shortly for a full narrative report._`;

  try {
    const report = await callGroqSimple(
      "You write concise, professional weekly status reports for a telecom PMO leadership audience. Use markdown headers and bullet points. Be factual — only use the data provided, never invent figures.",
      `Write this week's portfolio status report from the following data:\n\n${JSON.stringify(context)}`,
      900
    );
    res.json({ report, source: "groq-cloud" });
  } catch (err) {
    console.warn("Groq failed for weekly report, using fallback:", err.message);
    res.json({ report: fallbackReport, source: "fallback" });
  }
}

/* ============================================================
   MEETING MINUTES SUMMARIZATION
============================================================= */
export async function summarizeMeetingMinutes(req, res) {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "notes is required" });
  }

  const fallbackSummary = `**Raw notes (cloud summarization unavailable):**\n\n${notes}`;

  try {
    const summary = await callGroqSimple(
      "You turn raw, messy meeting notes into clean, structured minutes for a telecom PMO. Use markdown with sections for Decisions, Action Items (with owners if mentioned), and Open Questions. Never invent details not present in the notes.",
      `Summarize these raw meeting notes into structured minutes:\n\n${notes}`,
      700
    );
    res.json({ summary, source: "groq-cloud" });
  } catch (err) {
    console.warn("Groq failed for meeting minutes, using fallback:", err.message);
    res.json({ summary: fallbackSummary, source: "fallback" });
  }
}


export async function chatWithAI(req, res) {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No GROQ_API_KEY in environment");

    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...(Array.isArray(context?.history) ? context.history : []),
      { role: "user", content: question },
    ];

    const toolSchemas = Object.values(TOOLS).map((t) => t.schema);

    let finalMessage = null;
    const MAX_ROUNDS = 3;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b", // supports tool calling on Groq
          messages,
          tools: toolSchemas,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${await response.text()}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      if (!choice.message.tool_calls?.length) {
        console.log(`[AI] Answered "${question}" with NO tool call — verify this wasn't a data question.`);
        finalMessage = choice.message;
        break;
      }

      // Model wants data — run each requested tool, feed results back,
      // and let it decide on the next round whether it needs more.
      messages.push(choice.message);
      for (const call of choice.message.tool_calls) {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        console.log(`[AI TOOL CALL] ${call.function.name}(${JSON.stringify(args)})`);
        const result = await runTool(call.function.name, args);
        console.log(`[AI TOOL RESULT] ${call.function.name} ->`, JSON.stringify(result).slice(0, 500));
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }

      // Last allowed round — force a final answer instead of another tool call.
      if (round === MAX_ROUNDS - 1) {
        const closingResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages,
            temperature: 0.3,
            max_tokens: 800,
          }),
        });
        if (!closingResponse.ok) {
          throw new Error(`Groq API error on closing round: ${closingResponse.status} ${await closingResponse.text()}`);
        }
        const closingData = await closingResponse.json();
        finalMessage = closingData.choices[0].message;
      }
    }

    return res.json({
      reply: finalMessage.content,
      source: "groq-cloud",
      note: "Powered by Groq Cloud (free tier)",
    });
  } catch (err) {
    console.warn("Groq failed, using fallback:", err.message);
    const reply = await generateFallbackResponse(question, context || {});
    return res.json({
      reply,
      source: "fallback",
      note: "Cloud LLM unavailable. Using built-in rule engine with live DB lookups.",
    });
  }
}
