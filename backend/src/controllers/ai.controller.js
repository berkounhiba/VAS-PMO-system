import { pool } from "../config/db.js";

/* ============================================================
   PROMPT BUILDER — sends only scoped data, never the full raw DB
============================================================= */
function buildPrompt(question, context) {
  const { projects, risks, tasks, vendors, currentUser } = context;

  const delayedProjects = projects
    .filter((p) => p.delayDays > 0)
    .map((p) => `${p.name}: ${p.delayDays}d late, blocker: ${p.blocker || "none"}`);

  const openRisks = risks
    .filter((r) => r.status === "Open" || r.status === "Monitoring")
    .map((r) => `${r.project} — ${r.risk} (score ${r.score})`);

  const overdueVendors = vendors
    .filter((v) => v.status === "Overdue")
    .map((v) => `${v.vendor}: ${v.action} (${v.daysOpen}d open)`);

  const myPendingTasks = tasks
    .filter((t) => t.owner === currentUser && t.status !== "Done")
    .map((t) => t.task);

  return `You are the VAS AI Operations Assistant for a telecom PMO control tower.
Answer ONLY using the data below. Be concise, structured, and actionable.
Use markdown with **Answer**, **Evidence**, and **Recommendation** sections.

PORTFOLIO DATA:
- Total projects: ${projects.length}
- Delayed projects: ${delayedProjects.join("; ") || "None"}
- Open risks: ${openRisks.join("; ") || "None"}
- Overdue vendor actions: ${overdueVendors.join("; ") || "None"}
- Pending tasks for ${currentUser}: ${myPendingTasks.join(", ") || "None"}

USER QUESTION: ${question}

Keep your answer under 250 words.`;
}

/* ============================================================
   SMART FALLBACK — works instantly without any API key
============================================================= */
function generateFallbackResponse(question, context) {
  const q = question.toLowerCase();
  const { projects, risks, tasks, vendors, currentUser } = context;

  if (q.includes("morning brief") || q.includes("my day") || q.includes("priorities") || q.includes("today")) {
    const myOverdue = tasks.filter(
      (t) => t.owner === currentUser && new Date(t.finish) < new Date() && t.status !== "Done"
    );
    const delayed = projects.filter((p) => p.delayDays > 0).slice(0, 3);
    return `**Answer:** Good morning ${currentUser}! Here are your priorities today:

**Evidence:**
${myOverdue.length > 0 ? `- **Your overdue tasks:** ${myOverdue.map((t) => t.task).join(", ")}` : "- No overdue tasks assigned to you"}
${delayed.length > 0 ? `- **Top delayed projects:** ${delayed.map((p) => `${p.name} (${p.delayDays}d late)`).join(", ")}` : ""}
- **Open high-severity risks:** ${risks.filter((r) => r.score >= 9).length}

**Recommendation:** Clear any overdue tasks first, then review blocked dependencies.`;
  }

  if (q.includes("delay") || q.includes("late") || q.includes("blocking") || q.includes("blocked")) {
    const delayed = projects
      .filter((p) => p.delayDays > 0)
      .sort((a, b) => b.delayDays - a.delayDays);
    if (delayed.length === 0) return `**Answer:** No projects are currently delayed. Portfolio is on track!`;
    return `**Answer:** ${delayed.length} projects are currently delayed.

**Evidence:**
${delayed.map((p) => `- **${p.name}:** ${p.delayDays} days late — ${p.blocker || "No blocker recorded"}`).join("\n")}

**Recommendation:** ${delayed[0].name} has the longest delay. Immediate action: resolve "${delayed[0].blocker}".`;
  }

  if (q.includes("risk")) {
    const topRisks = risks.filter((r) => r.status === "Open").sort((a, b) => b.score - a.score).slice(0, 5);
    return `**Answer:** ${risks.filter((r) => r.status === "Open").length} risks are currently open.

**Evidence:**
${topRisks.map((r) => `- **${r.project}:** ${r.risk} (Score ${r.score}, ${r.probability}×${r.impact})`).join("\n")}

**Recommendation:** Address score-9 risks first: ${topRisks.filter((r) => r.score >= 9).map((r) => r.project).join(", ") || "N/A"}.`;
  }

  if (q.includes("vendor") || q.includes("overdue") || q.includes("supplier")) {
    const overdue = vendors.filter((v) => v.status === "Overdue");
    return `**Answer:** ${overdue.length} vendor actions are overdue.

**Evidence:**
${overdue.map((v) => `- **${v.vendor}** (${v.project}): ${v.action} — ${v.daysOpen} days open, owner: ${v.owner}`).join("\n") || "None overdue"}

**Recommendation:** ${overdue.length > 0 ? "Follow up on OpenCode security findings and DBA validation immediately." : "All vendor actions are on track."}`;
  }

  if (q.includes("overloaded") || q.includes("team") || q.includes("capacity") || q.includes("who")) {
    return `**Answer:** Team capacity is tracked on the Team Board.

**Evidence:**
- Engineers with >90% allocation are flagged red.
- Check individual task assignments and utilization percentages there.

**Recommendation:** Redistribute tasks from overloaded members to those with green capacity.`;
  }

  if (q.includes("go-live") || q.includes("golive") || q.includes("ready") || q.includes("deploy")) {
    const ready = projects.filter((p) => p.health === "Green" && p.delayDays === 0);
    const blocked = projects.filter((p) => p.status === "Blocked" || p.status === "Delayed");
    return `**Answer:** ${ready.length} projects are healthy and on track.

**Evidence:**
- Ready: ${ready.map((p) => p.name).join(", ") || "None currently"}
- Blocked/Delayed: ${blocked.map((p) => p.name).join(", ") || "None"}

**Recommendation:** Resolve blockers on ${blocked.slice(0, 2).map((p) => p.name).join(" and ") || "N/A"} before any Go-Live.`;
  }

  return `**Answer:** I analyzed the portfolio for "${question}".

**Evidence:**
- ${projects.length} projects in portfolio
- ${risks.filter((r) => r.status === "Open").length} open risks
- ${vendors.filter((v) => v.status === "Overdue").length} overdue vendor actions
- ${tasks.filter((t) => t.owner === currentUser && t.status !== "Done").length} pending tasks for you

**Recommendation:** Ask me specifically about delays, risks, vendors, Go-Live readiness, or your morning brief for a detailed answer.`;
}

/* ============================================================
   MAIN HANDLER — Groq Cloud with local fallback
============================================================= */
export async function chatWithAI(req, res) {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const prompt = buildPrompt(question, context);

  // Try Groq Cloud first
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No GROQ_API_KEY in environment");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          {
            role: "system",
            content:
              "You are the VAS AI Operations Assistant for a telecom PMO control tower. Answer ONLY using the data provided. Be concise, structured, and actionable. Use markdown with **Answer**, **Evidence**, and **Recommendation** sections.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return res.json({
      reply,
      source: "groq-cloud",
      note: "Powered by Groq Cloud (free tier)",
    });
  } catch (err) {
    // Smart fallback — works instantly without any API key
    console.warn("Groq failed, using fallback:", err.message);
    const reply = generateFallbackResponse(question, context);
    return res.json({
      reply,
      source: "fallback",
      note: "Cloud LLM unavailable. Using built-in rule engine.",
    });
  }
}
export async function draftVendorEmail(req, res) {
  const { vendor, action, daysOpen, owner, project } = req.body;

  const prompt = `You are a professional telecom PMO manager at Ooredoo. Draft a concise, polite but firm follow-up email to ${vendor} regarding this pending action on project "${project}": "${action}".

This action is ${daysOpen} days overdue. The email should:
1. Open with a professional greeting
2. Reference the project and the specific pending action
3. Note the delay (${daysOpen} days overdue)
4. Request an immediate status update and ETA
5. Mention escalation path if not resolved within 48 hours
6. Close professionally

Sign the email as: ${owner}, VAS PMO Team

Return ONLY the email body text. No markdown code blocks, no explanations.`;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No GROQ_API_KEY");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const email = data.choices[0].message.content.trim();

    return res.json({ email, source: "groq-cloud" });
  } catch (err) {
    console.warn("Groq email draft failed, using fallback:", err.message);
    const email = `Subject: Urgent Follow-up – ${project}: ${action}

Dear ${vendor} Team,

I hope this message finds you well.

I am writing to follow up on the pending action for the ${project} project: "${action}". This item is now ${daysOpen} days overdue, and its delay is impacting our delivery timeline.

Could you please provide an immediate status update and confirm the revised ETA for completion? If we do not receive a response within the next 48 hours, we will need to escalate this to senior management.

Thank you for your prompt attention to this matter.

Best regards,
${owner}
VAS PMO Team`;

    return res.json({ email, source: "fallback" });
  }
}