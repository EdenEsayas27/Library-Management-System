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

  const quickActions = [
    { icon: "📖", label: "Add Book", path: "/books", color: "from-amber-500 to-orange-500" },
    { icon: "👥", label: "Add Member", path: "/members", color: "from-emerald-500 to-teal-500" },
    { icon: "🔄", label: "Borrow Book", path: "/borrows", color: "from-cyan-500 to-blue-500" },
    { icon: "📊", label: "View Reports", path: "/reports", color: "from-purple-500 to-pink-500" },
  ];

  const statCards = [
    { key: "total_books", icon: "📚", label: "Total Books", color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
    { key: "total_members", icon: "👥", label: "Total Members", color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
    { key: "active_borrows", icon: "🔄", label: "Active Borrows", color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400" },
    { key: "overdue_books", icon: "⚠️", label: "Overdue Books", color: "from-rose-500/20 to-red-500/20", iconColor: "text-rose-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 via-teal-800/50 to-cyan-900/50 backdrop-blur-sm border border-white/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary">Dashboard</h2>
              <p className="mt-0.5 text-sm text-theme-secondary">
                Welcome back! Here's what's happening in your library today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-theme-primary">Quick Actions</h3>
          <span className="text-xs text-theme-secondary">⚡ Click to navigate</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-amber-500/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}></div>
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-2xl group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium text-theme-primary">{action.label}</p>
                  <p className="text-xs text-theme-secondary">Click to {action.label.toLowerCase()}</p>
                </div>
                <span className="ml-auto text-theme-secondary group-hover:text-theme-primary transition">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-theme-primary">Library Statistics</h3>
          {!loading && !error && stats && (
            <span className="text-xs text-theme-secondary">📈 Live data</span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
              <p className="text-sm text-theme-secondary">Loading statistics...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 p-4">
            <div className="flex items-center gap-2">
              <span className="text-rose-300">⚠️</span>
              <p className="text-sm font-medium text-rose-200">{error}</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-theme-secondary">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-theme-primary">
                        {stats[card.key]?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className={`text-3xl ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (stats[card.key] / 1000) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-theme-secondary">
                    {card.key === 'overdue_books' && stats[card.key] > 0 ? '⚠️ Needs attention' : '✓ Up to date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;