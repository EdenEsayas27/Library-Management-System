import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form
        className="grid w-full max-w-md gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-slate-900">Login</h2>
        <p className="text-sm text-slate-500">Use your staff account credentials.</p>

        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-blue-500"
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />

        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-blue-500"
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />

        {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
