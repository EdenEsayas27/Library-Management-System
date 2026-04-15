import { useEffect, useState } from "react";
import { reportsApi } from "../services/api";

function ReportsPage() {
  const [overdue, setOverdue] = useState([]);
  const [popular, setPopular] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const [overdueData, popularData] = await Promise.all([
          reportsApi.overdueBooks(),
          reportsApi.popularGenres(),
        ]);
        setOverdue(overdueData);
        setPopular(popularData);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load reports.");
      }
    }
    loadReports();
  }, []);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Overdue activity and genre popularity insights.</p>
      </div>
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Overdue Books</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Book</th>
              <th className="py-3 pr-4">Member</th>
              <th className="py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {overdue.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{row.books?.title || "-"}</td>
                <td className="py-3 pr-4">{row.members?.full_name || "-"}</td>
                <td className="py-3">{row.due_date}</td>
              </tr>
            ))}
            {!overdue.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="3">
                  No overdue books.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Popular Genres</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Genre</th>
              <th className="py-3">Borrow Count</th>
            </tr>
          </thead>
          <tbody>
            {popular.map((row) => (
              <tr key={row.genre_name} className="border-b border-slate-100">
                <td className="py-3 pr-4">{row.genre_name}</td>
                <td className="py-3">{row.borrow_count}</td>
              </tr>
            ))}
            {!popular.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="2">
                  No genre stats available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
