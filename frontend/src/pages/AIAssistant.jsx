import { useState, useRef, useEffect } from "react";
import { Bot, ShieldAlert, RefreshCw } from "lucide-react";
import { fetchAIChat } from "../api"; 

export default function AIAssistant({ currentUser, projects, tasks, milestones, risks, resources, dependencies, uatSit, golive, vendors, meetings, kpiHistory }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I'm the VAS AI Operations Assistant (prototype). Ask me about project health, risks, vendor actions, or your day." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = [
    "What is blocking my top delayed project?",
    "Which projects are at risk of missing Go-Live?",
    "Who is overloaded right now?",
    "Summarize the top risks this week.",
    "Prepare my morning brief.",
  ];

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  async function ask(question) {
    if (!question.trim() || loading) return;
    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build a scoped context (cleaner than dumping raw DB rows)
      const context = {
        currentUser,
        projects: projects.map((p) => ({
          name: p.name,
          status: p.status,
          health: p.health,
          delayDays: p.delayDays,
          blocker: p.blocker,
        })),
        risks: risks.map((r) => ({
          project: r.project,
          risk: r.risk,
          score: r.score,
          probability: r.probability,
          impact: r.impact,
          status: r.status,
        })),
        tasks: tasks.map((t) => ({
          task: t.task,
          owner: t.owner,
          status: t.status,
          finish: t.finish,
          project: t.project,
        })),
        vendors: vendors.map((v) => ({
          vendor: v.vendor,
          project: v.project,
          action: v.action,
          status: v.status,
          daysOpen: v.daysOpen,
          owner: v.owner,
        })),
      };

      const data = await fetchAIChat(question, context);

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: data.reply + (data.note ? `\n\n_*${data.note}*_` : ""),
        },
      ]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "AI service unreachable. Confirm the backend is running and the /api/ai/chat route is mounted.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[900px] flex flex-col h-full gap-4">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Bot size={20} /> VAS AI Operations Assistant</h1>
        <p className="text-[13px] text-muted mt-1">Prototype — not yet wired to real, permission-filtered data. See Sprint 5.</p>
      </div>

      <div className="bg-warning border border-warning rounded-md p-3 text-[11.5px] text-warning flex gap-2">
        <ShieldAlert size={15} className="shrink-0 mt-0.5" />
        <span><strong>AI Assistant:</strong> Powered by Groq Cloud (free tier) with a built-in fallback. No sensitive data leaves your machine unfiltered — only scoped portfolio summaries are sent.</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button key={q} onClick={() => ask(q)} className="text-[11.5px] px-2.5 py-1.5 rounded-full border border-default text-secondary hover:bg-input">{q}</button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-[360px] max-h-[480px] overflow-y-auto bg-panel border border-default rounded-md p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-md px-3 py-2 text-[12.5px] whitespace-pre-wrap ${m.role === "user" ? "bg-accent text-white" : "bg-input border border-default text-bubble"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-[11.5px] text-muted flex items-center gap-2"><RefreshCw size={12} className="animate-spin" /> Analyzing operational data…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask about a project, risk, vendor, or your day…"
          className="flex-1 bg-input border border-default rounded px-3 py-2.5 text-[12.5px] outline-none focus:border-accent"
        />
        <button onClick={() => ask(input)} className="px-4 rounded bg-accent text-white font-medium text-[12.5px]">Ask</button>
      </div>
    </div>
  );
}
