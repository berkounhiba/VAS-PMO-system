// frontend/src/pages/Meetings.jsx — COMPLETE FILE
import { useState } from "react";
import { Card } from "../components/ui";
import { fmtDate } from "../utils";
import { createMeeting, deleteMeeting } from "../api";

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
        topic, decision, action,
        meetingDate: date || null,
        meetingTime: time || null,
        status: "Planned",
      });
      onSaved(meeting);
    } catch (err) {
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
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded border border-default text-tertiary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium">
          {saving ? "Saving…" : "Save Meeting"}
        </button>
      </div>
    </div>
  );
}

export default function Meetings({ meetings }) {
  const [showForm, setShowForm] = useState(false);
  // Own local copy so add/delete work immediately without needing to
  // re-lift state all the way up to App.jsx.
  const [items, setItems] = useState(
    meetings.map((m) => ({ ...m, id: m.id }))
  );

  async function handleDelete(id) {
    if (!id) return; // safety: can't delete something with no real id
    if (!confirm("Delete this meeting?")) return;
    try {
      await deleteMeeting(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Couldn't delete — check the backend is running.");
    }
  }

  return (
    <div className="space-y-5 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Meetings & Action Items</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-[12px] px-3 py-1.5 rounded bg-accent text-white font-medium"
        >
          {showForm ? "Close" : "+ New Meeting"}
        </button>
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
                date: m.meeting_date,
                time: m.meeting_time,
                owner: "—",
                project: "Portfolio",
                status: m.status,
              },
              ...prev,
            ]);
            setShowForm(false);
          }}
        />
      )}

      <Card title="Recent & Upcoming">
        {items.length === 0 && <div className="text-[12px] text-muted">No meetings recorded yet.</div>}
        {items.map((m, i) => (
          <div key={m.id ?? i} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium">{m.topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">
                  {fmtDate(m.date)}{m.time ? ` · ${m.time.slice(0, 5)}` : ""}
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
            <div className="text-[11px] text-muted mt-0.5">{m.project}</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-[11.5px]">
              <div><span className="text-muted">Decision: </span>{m.decision}</div>
              <div><span className="text-muted">Action ({m.owner}): </span>{m.action}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}