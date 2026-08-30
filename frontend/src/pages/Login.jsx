import { useState } from "react";
import { API_BASE } from "../api";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Login failed");
      }
      const { token, user } = await res.json();
      localStorage.setItem("vas_token", token);
      onLogin(user, token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen theme-dark bg-app text-primary flex items-center justify-center">
      <form onSubmit={submit} className="w-[340px] bg-panel border border-default rounded-md p-6 space-y-4">
        <div className="text-center mb-2">
          <div className="w-9 h-9 rounded gradient-accent flex items-center justify-center font-bold text-[14px] text-onaccent mx-auto mb-2">V</div>
          <h1 className="text-[15px] font-bold">VAS Control Tower</h1>
          <p className="text-[11px] text-muted mt-0.5">Ooredoo · Service Operations</p>
        </div>
        <div>
          <label className="text-[11px] text-muted block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[13px] outline-none focus:border-accent"
            autoFocus
          />
        </div>
        <div>
          <label className="text-[11px] text-muted block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input border border-default rounded px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
        </div>
        {error && <div className="text-[11px] text-red">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white font-medium text-[13px] py-2 rounded disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
