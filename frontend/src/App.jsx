import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid, User, FolderKanban, ShieldAlert, FlaskConical,
  Building2, CalendarClock, Bot, Settings, Search, Bell,
  Sun, Moon, LogOut, FileText, ClipboardList,
} from "lucide-react";

import { THEME_CSS } from "./theme";
import { accentFor, fuzzyMatch, calculateAutoHealth } from "./utils";
import { ROLES, hasPerm } from "./roles";
import {
  fetchProjects, fetchTasks, fetchUsers, fetchMilestones, fetchRisks,
  fetchDependencies, fetchUatSit, fetchGolive, fetchVendors, fetchMeetings, fetchKpis,
  fetchWeeklySummaries, fetchMe, updateTaskStatus as apiUpdateTaskStatus,
} from "./api";
import {
  buildLookups, normalizeProject, normalizeTask, normalizeMilestone, normalizeRisk,
  normalizeDependency, normalizeUatSit, normalizeGolive, normalizeVendor, normalizeMeeting, normalizeKpi,
} from "./normalize";
import { NoAccess } from "./components/ui";
import Login from "./pages/Login";
import MyDay from "./pages/MyDay";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Projects from "./pages/Projects";
import TeamBoard from "./pages/TeamBoard";
import RisksDependencies from "./pages/RisksDependencies";
import DeliveryControl from "./pages/DeliveryControl";
import Vendors from "./pages/Vendors";
import Meetings from "./pages/Meetings";
import AIAssistant from "./pages/AIAssistant";
import Admin from "./pages/Admin";
import ProjectTimeline from "./pages/ProjectTimeline";


const NAV = [
  { id: "home", label: "My Day", icon: User },
  { id: "exec", label: "Executive Dashboard", icon: LayoutGrid },
  { id: "team", label: "Team Board", icon: LayoutGrid },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "risks", label: "Risks & Dependencies", icon: ShieldAlert },
  { id: "delivery", label: "Delivery Control", icon: FlaskConical },
  { id: "vendors", label: "Vendors Actions", icon: Building2 },
  { id: "meetings", label: "Meetings & Actions", icon: CalendarClock },
  { id: "ai", label: "AI Operations Assistant", icon: Bot },
  { id: "admin", label: "Administration", icon: Settings },
  { id: "timeline", label: "Timeline", icon: CalendarClock },
];

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [darkMode, setDarkMode] = useState(true);
  const mainRef = useRef(null);
  const [page, setPage] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);

  const [rawProjects, setRawProjects] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [rawMilestones, setRawMilestones] = useState([]);
  const [rawRisks, setRawRisks] = useState([]);
  const [rawDependencies, setRawDependencies] = useState([]);
  const [rawUatSit, setRawUatSit] = useState([]);
  const [rawGolive, setRawGolive] = useState([]);
  const [rawVendors, setRawVendors] = useState([]);
  const [rawMeetings, setRawMeetings] = useState([]);
  const [rawKpis, setRawKpis] = useState([]);
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("vas_token");
    if (!savedToken) {
      setAuthChecked(true);
      return;
    }
    fetchMe(savedToken)
      .then(({ user }) => {
        setAuthUser(user);
        setAuthToken(savedToken);
        setAuthChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("vas_token");
        setAuthChecked(true);
      });
  }, []);

  function handleLogin(user, token) {
    setAuthUser(user);
    setAuthToken(token);
    setPage("home");
  }

  function handleLogout() {
    localStorage.removeItem("vas_token");
    setAuthUser(null);
    setAuthToken(null);
    setPage("home");
  }

  useEffect(() => {
    if (!authUser) return;
    Promise.all([
      fetchProjects(), fetchTasks(), fetchUsers(), fetchMilestones(), fetchRisks(),
      fetchDependencies(), fetchUatSit(), fetchGolive(), fetchVendors(), fetchMeetings(), fetchKpis(),
      fetchWeeklySummaries(),
    ])
      .then(([p, t, u, m, r, dep, uat, gl, v, mt, k, ws]) => {
        setRawProjects(p); setRawTasks(t); setUsers(u); setRawMilestones(m); setRawRisks(r);
        setRawDependencies(dep); setRawUatSit(uat); setRawGolive(gl); setRawVendors(v);
        setRawMeetings(mt); setRawKpis(k); setWeeklySummaries(ws);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoadError(err.message);
        setLoading(false);
      });
  }, [authUser]);

  const lookups = buildLookups(rawProjects, users);

  const tasks = rawTasks.map((t) => normalizeTask(t, lookups));
  const milestones = rawMilestones.map((m) => normalizeMilestone(m, lookups));
  const risks = rawRisks.map((r) => normalizeRisk(r, lookups));
  const dependencies = rawDependencies.map((d) => normalizeDependency(d, lookups));
  const uatSit = rawUatSit.map((u) => normalizeUatSit(u, lookups));
  const golive = rawGolive.map((g) => normalizeGolive(g, lookups));
  const vendors = rawVendors.map((v) => normalizeVendor(v, lookups));
  const meetings = rawMeetings.map((m) => normalizeMeeting(m, lookups));
  const kpiHistory = rawKpis.map(normalizeKpi);

  const projects = rawProjects.map((p) => {
    const normalized = normalizeProject(p, lookups);
    const pTasks = rawTasks.filter((t) => t.project_id === p.id || t.project === p.name);
    const pMilestones = rawMilestones.filter((m) => m.project_id === p.id);
    const pRisks = rawRisks.filter((r) => r.project_id === p.id);
    const pDeps = rawDependencies.filter((d) => d.project_id === p.id);
    return {
      ...normalized,
      health: calculateAutoHealth(normalized, pTasks, pMilestones, pRisks, pDeps),
    };
  });

  const resources = users
    .filter((u) => u.access_level !== "admin")
    .map((u) => ({
      name: u.name,
      role: u.role,
      skills: u.skills ?? "—",
      capacity: u.capacity_pct !== null && u.capacity_pct !== undefined ? Number(u.capacity_pct) / 100 : 1,
      allocated: u.allocated_pct !== null && u.allocated_pct !== undefined ? Number(u.allocated_pct) / 100 : 0,
      projects: [...new Set(tasks.filter((t) => t.owner === u.name).map((t) => t.project))].join(", ") || "—",
    }));

  const role = authUser?.access_level ?? "engineer";
  const currentUser = authUser?.name ?? "";

  useEffect(() => { mainRef.current?.scrollTo(0, 0); }, [page]);

  const visibleNav = NAV.filter((n) => {
    if (n.id === "admin") return hasPerm(role, "*");
    if (n.id === "vendors" || n.id === "meetings") return role !== "engineer";
    return true;
  });

  function handleSummaryAdded(newSummary) {
    setWeeklySummaries((prev) => [newSummary, ...prev]);
  }

  async function handleCycleTaskStatus(taskId, newStatus) {
    try {
      await apiUpdateTaskStatus(taskId, newStatus);
      setRawTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Couldn't save that status change — check the backend is running.");
    }
  }

  if (!authChecked) {
    return (
      <div className="w-screen h-screen theme-dark bg-app text-primary flex items-center justify-center">
        <style>{THEME_CSS}</style>
        <div className="text-[13px] text-muted">Checking session…</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <>
        <style>{THEME_CSS}</style>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="w-screen h-screen theme-dark bg-app text-primary flex items-center justify-center">
        <style>{THEME_CSS}</style>
        <div className="text-[13px] text-muted">Loading operational data…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-screen h-screen theme-dark bg-app text-primary flex items-center justify-center">
        <style>{THEME_CSS}</style>
        <div className="text-[13px] text-red text-center max-w-md">
          Couldn't reach the backend ({loadError}). Confirm the API server is running, the new routes are
          mounted, and the port in src/api.js matches.
        </div>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen ${darkMode ? "theme-dark" : "theme-light"} bg-app text-primary flex overflow-hidden`} style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{THEME_CSS}</style>
      <aside className="w-[224px] shrink-0 bg-sidebar border-r border-default flex flex-col">
        <div className="px-4 py-4 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded gradient-accent flex items-center justify-center font-bold text-[12px] text-onaccent">V</div>
            <div>
              <div className="text-[13px] font-bold tracking-tight leading-none">VAS Control Tower</div>
              <div className="text-[10px] text-muted mt-0.5">Ooredoo · Service Operations</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors ${active ? "bg-active text-primary" : "text-tertiary hover:bg-input hover-text-bubble"}`}
                style={active ? { borderLeft: "2px solid #6366F1" } : { borderLeft: "2px solid transparent" }}
              >
                <Icon size={15} strokeWidth={2} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-default">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 text-[12px] text-tertiary hover-text-primary border border-default rounded px-2.5 py-1.5"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-default flex items-center justify-between px-5 shrink-0 bg-app">
          <SearchBar
            projects={projects}
            tasks={tasks}
            risks={risks}
            vendors={vendors}
            users={users}
            onNavigate={(newPage, item) => {
              setPage(newPage);
              if (item) setSelectedProject(item);
            }}
          />
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode((d) => !d)} className="flex items-center gap-1.5 text-tertiary hover-text-primary border border-default rounded px-2.5 py-1.5 text-[11px] font-medium">
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {darkMode ? "Light" : "Dark"}
            </button>
            <button className="relative text-tertiary hover-text-primary"><Bell size={17} /></button>
            <div className="flex items-center gap-2 pl-3 border-l border-default">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{ background: accentFor(currentUser) }}>
                {currentUser.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-none">
                <div className="text-[12px] font-medium">{currentUser}</div>
                <div className="text-[10px] text-muted">{ROLES[role]?.label ?? role}</div>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          {page === "home" && (
            <MyDay role={role} currentUser={currentUser} tasks={tasks} milestones={milestones} risks={risks}
              vendors={vendors} meetings={meetings}
              onOpenProject={(p) => { setSelectedProject(p); setPage("projects"); }} />
          )}
          {page === "exec" && (
            <ExecutiveDashboard darkMode={darkMode} projects={projects} risks={risks}
              golive={golive} vendors={vendors} kpiHistory={kpiHistory} meetings={meetings} tasks={tasks} currentUser={currentUser} />
          )}
          {page === "team" && (
            <TeamBoard
              tasks={tasks}
              resources={resources}
              currentUser={currentUser}
              onOpenProject={(p) => { setSelectedProject(p); setPage("projects"); }}
              onCycleStatus={handleCycleTaskStatus}
            />
          )}
          {page === "projects" && (
            <Projects
              projects={projects}
              tasks={tasks}
              milestones={milestones}
              risks={risks}
              dependencies={dependencies}
              uatSit={uatSit}
              golive={golive}
              vendors={vendors}
              users={users}
              role={role}
              currentUser={currentUser}
              selected={selectedProject}
              setSelected={setSelectedProject}
            />
          )}
          {page === "risks" && (
            <RisksDependencies
              risks={risks}
              dependencies={dependencies}
              currentUser={currentUser}
            />
          )}
          {page === "delivery" && (
            <DeliveryControl uatSit={uatSit} golive={golive} />
          )}
          {page === "vendors" && (
            <Vendors
              role={role}
              vendors={vendors}
              currentUser={currentUser}
            />
          )}
          {page === "meetings" && (
            <Meetings
              meetings={meetings}
              users={users}
              currentUserId={authUser.id}
              currentUser={currentUser}
              weeklySummaries={weeklySummaries}
              onSummaryAdded={handleSummaryAdded}
            />
          )}
          {page === "ai" && (
            <AIAssistant
              currentUser={currentUser}
              projects={projects}
              tasks={tasks}
              milestones={milestones}
              risks={risks}
              resources={resources}
              dependencies={dependencies}
              uatSit={uatSit}
              golive={golive}
              vendors={vendors}
              meetings={meetings}
              kpiHistory={kpiHistory}
            />
          )}
          {page === "admin" && hasPerm(role, "*") && (
            <Admin users={users} resources={resources} />
          )}
          {page === "admin" && !hasPerm(role, "*") && <NoAccess />}
          {page === "timeline" && <ProjectTimeline projects={projects} />}
        </main>
      </div>
    </div>
  );
}

function SearchBar({ projects, tasks, risks, vendors, users, onNavigate }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = [];
  if (query.length >= 2) {
    projects.filter(p => fuzzyMatch(query, p.name)).forEach(p => results.push({ type: "Project", label: p.name, sub: p.status, page: "projects", item: p.name }));
    tasks.filter(t => fuzzyMatch(query, t.task)).forEach(t => results.push({ type: "Task", label: t.task, sub: t.project, page: "projects", item: t.project }));
    risks.filter(r => fuzzyMatch(query, r.risk)).forEach(r => results.push({ type: "Risk", label: r.risk, sub: r.project, page: "risks" }));
    vendors.filter(v => fuzzyMatch(query, v.vendor) || fuzzyMatch(query, v.action)).forEach(v => results.push({ type: "Vendor", label: v.vendor, sub: v.action, page: "vendors" }));
    users.filter(u => fuzzyMatch(query, u.name)).forEach(u => results.push({ type: "Person", label: u.name, sub: u.role, page: "team" }));
  }

  return (
    <div ref={ref} className="relative w-[340px]">
      <div className="flex items-center gap-2 bg-input border border-default rounded px-3 py-1.5">
        <Search size={14} className="text-muted" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search projects, risks, vendors, people…"
          className="bg-transparent outline-none text-[12px] placeholder-dim w-full"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-panel border border-default rounded-md shadow-lg max-h-[320px] overflow-y-auto z-50">
          {results.slice(0, 8).map((r, i) => (
            <button
              key={i}
              onClick={() => { onNavigate(r.page, r.item); setQuery(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-active border-b border-default last:border-0 flex items-center justify-between"
            >
              <div>
                <div className="text-[12px] font-medium text-primary">{r.label}</div>
                <div className="text-[11px] text-muted">{r.type} · {r.sub}</div>
              </div>
              <span className="text-[10px] text-accent uppercase tracking-wider">{r.type}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-panel border border-default rounded-md p-3 text-[12px] text-muted z-50">No results found.</div>
      )}
    </div>
  );
}