import { useState } from "react";
import { Card } from "../components/ui";
import { summarizeMeetingMinutes } from "../api";
import { ClipboardList, Sparkles, Copy, Check } from "lucide-react";

export default function MeetingMinutesAI() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSummarize() {
    if (!notes.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const data = await summarizeMeetingMinutes(notes);
      setSummary(data.summary);
    } catch (e) {
      setSummary("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-[900px]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList size={20} /> Meeting Minutes AI
        </h1>
        <p className="text-[13px] text-muted mt-1">Paste raw notes and get structured minutes</p>
      </div>

      <Card title="Raw Meeting Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your raw meeting notes here...
Example:
- Amir said security audit is 80% done
- Decision: Go-Live pushed to Sept 15
- Action: Nesrine to follow up with DBA by Friday
- Risk: Flag V1.1 might miss marketing deadline"
          className="w-full h-40 bg-input border border-default rounded-md p-3 text-[12.5px] text-primary placeholder-dim resize-none outline-none focus:border-accent"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSummarize}
            disabled={loading || !notes.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded bg-accent text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Sparkles size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Analyzing…" : "Summarize with AI"}
          </button>
        </div>
      </Card>

      {summary && (
        <Card
          title="Structured Minutes"
          right={
            <button onClick={copySummary} className="flex items-center gap-1.5 text-[11px] text-accent hover:underline">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          }
        >
          <div className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-secondary font-mono">
            {summary}
          </div>
        </Card>
      )}
    </div>
  );
}