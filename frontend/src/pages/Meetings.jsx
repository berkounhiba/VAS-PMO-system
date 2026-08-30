import { useState } from "react";
import { Card, MineToggle } from "../components/ui";
import { fmtDate } from "../utils";
import { getTuesdayOfWeek, getSummaryTurn } from "../rotation";
import { createWeeklySummary } from "../api";

function WeeklyTeamMeeting({ users, currentUserId, weeklySummaries, onSummaryAdded }) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const thisTuesday = getTuesdayOfWeek();
  const turnUser = getSummaryTurn(users, thisTuesday);
  const isMyTurn = turnUser && turnUser.id === currentUserId;

  const dateKey = thisTuesday.toISOString().slice(0, 10);
  const alreadyWritten = weeklySummaries.find((s) => s.meetingDate?.slice(0, 10) === dateKey);

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
          Summary writer this week: <span className="font-semibold">{turnUser?.name ?? "—"}</span>
        </span>
        {isMyTurn && !alreadyWritten && (
          <span className="text-[11px] font-semibold text-accent">It's your turn</span>
        )}
      </div>

      {alreadyWritten ? (
        <div className="p-3 rounded bg-sidebar border border-default">
          <div className="text-[11px] text-muted mb-1">
            Written by {alreadyWritten.authorName} · {fmtDate(alreadyWritten.createdAt)}
          </div>
          <div className="text-[12.5px] whitespace-pre-wrap">{alreadyWritten.summary}</div>
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
          {error && <div className="text-[11px] text-red">{error}</div>}
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
          No summary yet this week — waiting on {turnUser?.name ?? "the assigned person"}.
        </div>
      )}
    </Card>
  );
}

export default function Meetings({ meetings, users, currentUserId, currentUser, weeklySummaries, onSummaryAdded }) {
  const [mineOnly, setMineOnly] = useState(false);
  const shownMeetings = mineOnly ? meetings.filter((m) => m.owner === currentUser) : meetings;

  return (
    <div className="space-y-5 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Meetings & Action Items</h1>
        <MineToggle active={mineOnly} onToggle={() => setMineOnly((v) => !v)} label="My Meetings" />
      </div>

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
              <div key={s.id} className="p-2.5 rounded bg-sidebar border border-default">
                <div className="text-[11px] text-muted mb-1">
                  {fmtDate(s.meetingDate)} · {s.authorName}
                </div>
                <div className="text-[12px] text-tertiary whitespace-pre-wrap">{s.summary}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Recent & Upcoming">
        {shownMeetings.length === 0 && <div className="text-[12px] text-muted">No meetings to show.</div>}
        {shownMeetings.map((m, i) => (
          <div key={i} className="p-3 rounded bg-sidebar border border-default mb-2 last:mb-0">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium">{m.topic}</span>
              <span className="text-[11px] text-muted">{fmtDate(m.date)}</span>
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
