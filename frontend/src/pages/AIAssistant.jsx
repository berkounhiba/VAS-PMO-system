import { useState, useRef, useEffect } from "react";
import { Bot, ShieldAlert, RefreshCw } from "lucide-react";

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
      // NOTE: still a browser-side stub — calls the Anthropic API directly
      // with no key configured and the full dataset in context. Do NOT
      // point this at real Ooredoo data. Sprint 5 replaces this with a
      // backend service using scoped tools (get_project, get_risks, ...)
      // that only returns what the logged-in user is allowed to see.
      const context = { projects, milestones, tasks, resources, risks, dependencies, uatSit, golive, vendors, meetings, kpiHistory };
      const systemPrompt = `You are the VAS AI Operations Assistant for a telecom PMO control tower. Answer the current user's question ONLY using the JSON data provided — never invent projects, names, or numbers not present in it. Structure your answer with short markdown sections: **Answer**, **Evidence**, and where relevant **Analysis** and **Recommendation**. Keep it concise. The current user is ${currentUser}.\n\nDATA:\n${JSON.stringify(context)}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: question }],
        }),
      });
      const data = await response.json();
      const text = data?.content?.find((b) => b.type === "text")?.text || "I couldn't generate a response.";
      setMessages([...newMessages, { role: "assistant", text }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", text: "Something went wrong reaching the AI layer. This is still a prototype stub — Sprint 5 wires this through the real backend AI service." }]);
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
        <span><strong>Prototype notice:</strong> do not connect this to real Ooredoo data until Legal/InfoSec has approved external data transfer and a backend with scoped, permission-aware tools is in place (Sprint 5).</span>
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
