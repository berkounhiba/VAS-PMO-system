import { useState } from "react";
import { Card, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { getTuesdayOfWeek, getSummaryTurn } from "../rotation";
import { createWeeklySummary, createMeeting, deleteMeeting } from "../api";

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
        topic,
        decision,
        action,
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
    <div className="p-4 rounded bg-sidebar border border-default space-y-2 mb-3">
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Meeting topic (required)"
        className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
      />

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1 bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
        />
      </div>

      <input
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        placeholder="Decision"
        className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
      />

      <input
        value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="Action item"
        className="w-full bg-input border border-default rounded px-3 py-2 text-[12.5px] outline-none"
      />

      <div className="flex gap-2 justify-end">
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

  // Local copy so newly created/deleted meetings appear immediately.
  const [items, setItems] = useState(
    meetings.map((m) => ({ ...m, id: m.id }))
  );

  const shownMeetings = mineOnly
    ? items.filter((m) => m.owner === currentUser)
    : items;

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

  return (
    <div className="space-y-5 max-w-[1000px]">

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
            onClick={() => setShowForm((s) => !s)}
            className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium"
          >
            {showForm ? "Close" : "+ New Meeting"}
          </button>
        </div>
      </div>

      {showForm && (
        <NewMeetingForm
          onCancel={() => setShowForm(false)}
          onSaved={(m) => {
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
          }}
        />
      )}

      <WeeklyTeamMeeting
        users={users}
        currentUserId={currentUserId}
        weeklySummaries={weeklySummaries}
        onSummaryAdded={onSummaryAdded}
      />

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

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">
                  {fmtDate(m.date)}
                  {m.time
                    ? ` · ${m.time.slice(0, 5)}`
                    : ""}
                </span>

                {m.id && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-[11px] text-red hover:underline"
                  >
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