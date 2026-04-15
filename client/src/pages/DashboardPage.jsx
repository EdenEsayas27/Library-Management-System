import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../services/api";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await reportsApi.stats();
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Overview and quick actions.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          onClick={() => navigate("/books")}
        >
          Add Book
        </button>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          onClick={() => navigate("/members")}
        >
          Add Member
        </button>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          onClick={() => navigate("/borrows")}
        >
          Borrow Book
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading statistics...</p>}
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Total Books</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total_books}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Total Members</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total_members}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Active Borrows</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.active_borrows}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Overdue Books</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.overdue_books}</p>
          </article>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
