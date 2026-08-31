import { useState } from "react";
import { Card, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { getTuesdayOfWeek, getSummaryTurn } from "../rotation";
import {
  createWeeklySummary,
  createMeeting,
  deleteMeeting,
  summarizeMeetingMinutes,
} from "../api";
import { Sparkles, Copy, Check, Trash2 } from "lucide-react";


/* =========================================================
   WEEKLY TEAM MEETING
   ========================================================= */

function WeeklyTeamMeeting({
  users,
  currentUserId,
  weeklySummaries,
  onSummaryAdded,
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const thisTuesday = getTuesdayOfWeek();
  const turnUser = getSummaryTurn(users, thisTuesday);
  const isMyTurn = turnUser && turnUser.id === currentUserId;

  const dateKey = thisTuesday.toISOString().slice(0, 10);

  const alreadyWritten = weeklySummaries.find(
    (s) => s.meetingDate?.slice(0, 10) === dateKey
  );

  async function submit() {
    if (!draft.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const created = await createWeeklySummary({
        meeting_date: dateKey,
        summary: draft.trim(),
        author_id: currentUserId,
      });

      onSummaryAdded(created);
      setDraft("");
    } catch (err) {
      console.error(err);
      setError("Couldn't save — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Weekly Team Meeting"
      subtitle={`Every Tuesday · This week: ${fmtDate(thisTuesday)}`}
    >
      <div className="flex items-center justify-between mb-3 p-2.5 rounded bg-sidebar border border-default">
        <span className="text-[12.5px]">
          Summary writer this week:{" "}
          <span className="font-semibold">
            {turnUser?.name ?? "—"}
          </span>
        </span>

        {isMyTurn && !alreadyWritten && (
          <span className="text-[11px] font-semibold text-accent">
            It's your turn
          </span>
        )}
      </div>

      {alreadyWritten ? (
        <div className="p-3 rounded bg-sidebar border border-default">
          <div className="text-[11px] text-muted mb-1">
            Written by {alreadyWritten.authorName} ·{" "}
            {fmtDate(alreadyWritten.createdAt)}
          </div>

          <div className="text-[12.5px] whitespace-pre-wrap">
            {alreadyWritten.summary}
          </div>
        </div>
      ) : isMyTurn ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write this week's meeting summary…"
            rows={4}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent resize-none"
          />

          {error && (
            <div className="text-[11px] text-red">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={saving || !draft.trim()}
            className="text-[11px] font-medium bg-accent text-white px-3 py-1.5 rounded disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save summary"}
          </button>
        </div>
      ) : (
        <div className="text-[12px] text-muted">
          No summary yet this week — waiting on{" "}
          {turnUser?.name ?? "the assigned person"}.
        </div>
      )}
    </Card>
  );
}


/* =========================================================
   NEW MEETING FORM
   ========================================================= */

function NewMeetingForm({ onSaved, onCancel }) {
  const [topic, setTopic] = useState("");
  const [decision, setDecision] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!topic.trim()) return;

    setSaving(true);

    try {
      const meeting = await createMeeting({
        topic: topic.trim(),
        decision: decision.trim(),
        action: action.trim(),
        meetingDate: date || null,
        meetingTime: time || null,
        status: "Planned",
      });

      onSaved(meeting);
    } catch (err) {
      console.error(err);
      alert("Couldn't save the meeting — check the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded bg-sidebar border border-default space-y-3 mb-3">

      <div>
        <label className="block text-[11px] text-muted mb-1">
          Meeting topic
        </label>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Meeting topic (required)"
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-[11px] text-muted mb-1">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          />
        </div>

        <div className="flex-1">
          <label className="block text-[11px] text-muted mb-1">
            Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1">
          Decision
        </label>

        <input
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="What was decided?"
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1">
          Action item
        </label>

        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !topic.trim()}
          className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Meeting"}
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   AI MEETING MINUTES
   ========================================================= */

function AIMeetingMinutes() {
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
    } catch (err) {
      console.error(err);
      setSummary("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copySummary() {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  return (
    <Card
      title="AI Meeting Minutes"
      subtitle="Paste raw notes → get structured minutes"
    >
      <div className="space-y-3">

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Paste raw meeting notes here...

Example:
- Amir said security audit is 80% done
- Decision: Go-Live pushed to Sept 15
- Action: Nesrine to follow up with DBA by Friday
- Risk: Flag V1.1 might miss marketing deadline`}
          className="w-full h-32 bg-input border border-default rounded-md p-3 text-[12.5px] text-primary placeholder-dim resize-none outline-none focus:border-accent"
        />

        <div className="flex justify-between items-center">

          <span className="text-[11px] text-muted">
            AI extracts decisions, actions, risks, and next steps.
          </span>

          <button
            onClick={handleSummarize}
            disabled={loading || !notes.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded bg-accent text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles
              size={14}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Analyzing…" : "Summarize"}
          </button>
        </div>

        {summary && (
          <div className="mt-4 border-t border-default pt-4">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[12px] font-semibold text-secondary">
                Structured Minutes
              </span>

              <button
                onClick={copySummary}
                className="flex items-center gap-1 text-[11px] text-accent hover:underline"
              >
                {copied ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}

                {copied ? "Copied!" : "Copy"}
              </button>

            </div>

            <div className="bg-sidebar border border-default rounded-md p-3 text-[12px] whitespace-pre-wrap font-mono leading-relaxed text-secondary">
              {summary}
            </div>

          </div>
        )}

      </div>
    </Card>
  );
}


/* =========================================================
   MAIN MEETINGS PAGE
   ========================================================= */

export default function Meetings({
  meetings,
  users,
  currentUserId,
  currentUser,
  weeklySummaries,
  onSummaryAdded,
}) {
  const [mineOnly, setMineOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Local copy so newly created/deleted meetings appear immediately.
  const [items, setItems] = useState(
    meetings.map((m) => ({ ...m, id: m.id }))
  );

  const shownMeetings = mineOnly
    ? items.filter((m) => m.owner === currentUser)
    : items;


  /* ---------------------------------------------------------
     DELETE MEETING
     --------------------------------------------------------- */

  async function handleDelete(id) {
    if (!id) return;

    if (!confirm("Delete this meeting?")) return;

    try {
      await deleteMeeting(id);

      setItems((prev) =>
        prev.filter((m) => m.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Couldn't delete — check the backend is running.");
    }
  }


  /* ---------------------------------------------------------
     ADD MEETING TO LOCAL LIST
     --------------------------------------------------------- */

  function handleMeetingSaved(m) {
    setItems((prev) => [
      {
        id: m.id,
        topic: m.topic,
        decision: m.decision,
        action: m.action,
        date: m.meeting_date ?? m.meetingDate,
        time: m.meeting_time ?? m.meetingTime,
        owner: m.owner ?? "—",
        project: m.project ?? "Portfolio",
        status: m.status,
      },
      ...prev,
    ]);

    setShowForm(false);
  }


  return (
    <div className="space-y-5 max-w-[1000px]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex items-center justify-between">

        <h1 className="text-xl font-bold">
          Meetings & Action Items
        </h1>

        <div className="flex items-center gap-2">

          <MineToggle
            active={mineOnly}
            onToggle={() => setMineOnly((v) => !v)}
            label="My Meetings"
          />

          <button
            onClick={() => setShowAI((v) => !v)}
            className="flex items-center gap-2 text-[12px] px-3 py-1.5 rounded border border-default text-accent hover:bg-sidebar"
          >
            <Sparkles size={14} />

            {showAI ? "Close AI" : "AI Minutes"}
          </button>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium"
          >
            {showForm ? "Close" : "+ New Meeting"}
          </button>

        </div>

      </div>


      {/* =====================================================
          NEW MEETING FORM
          ===================================================== */}

      {showForm && (
        <NewMeetingForm
          onCancel={() => setShowForm(false)}
          onSaved={handleMeetingSaved}
        />
      )}


      {/* =====================================================
          AI MEETING MINUTES
          ===================================================== */}

      {showAI && <AIMeetingMinutes />}


      {/* =====================================================
          WEEKLY TEAM MEETING
          ===================================================== */}

      <WeeklyTeamMeeting
        users={users}
        currentUserId={currentUserId}
        weeklySummaries={weeklySummaries}
        onSummaryAdded={onSummaryAdded}
      />


      {/* =====================================================
          PAST WEEKLY SUMMARIES
          ===================================================== */}

      {weeklySummaries.length > 1 && (
        <Card title="Past Weekly Summaries">

          <div className="space-y-2">

            {weeklySummaries.slice(1).map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded bg-sidebar border border-default"
              >

                <div className="text-[11px] text-muted mb-1">
                  {fmtDate(s.meetingDate)} · {s.authorName}
                </div>

                <div className="text-[12px] text-tertiary whitespace-pre-wrap">
                  {s.summary}
                </div>

              </div>
            ))}

          </div>

        </Card>
      )}


      {/* =====================================================
          RECENT & UPCOMING MEETINGS
          ===================================================== */}

      <Card title="Recent & Upcoming">

        {shownMeetings.length === 0 && (
          <div className="text-[12px] text-muted">
            No meetings to show.
          </div>
        )}

        {shownMeetings.map((m, i) => (
          <div
            key={m.id ?? i}
            className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0"
          >

            <div className="flex items-center justify-between">

              <span className="text-[12.5px] font-medium">
                {m.topic}
              </span>

              <div className="flex items-center gap-3">

                <span className="text-[11px] text-muted">
                  {fmtDate(m.date)}
                  {m.time
                    ? ` · ${m.time.slice(0, 5)}`
                    : ""}
                </span>

                {m.id && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="flex items-center gap-1 text-[11px] text-red hover:underline"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}

              </div>

            </div>


            <div className="text-[11px] text-muted mt-0.5">
              {m.project}
            </div>


            <div className="mt-2 grid grid-cols-2 gap-3 text-[11.5px]">

              <div>
                <span className="text-muted">
                  Decision:{" "}
                </span>

                {m.decision || "—"}
              </div>

              <div>
                <span className="text-muted">
                  Action ({m.owner}):{" "}
                </span>

                {m.action || "—"}
              </div>

            </div>

          </div>
        ))}

      </Card>

    </div>
  );
}