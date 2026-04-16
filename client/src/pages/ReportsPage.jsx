import { useEffect, useState } from "react";
import { reportsApi } from "../services/api";

function ReportsPage() {
  const [overdue, setOverdue] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalOverdue: 0,
    mostPopularGenre: "",
    highestBorrowCount: 0
  });

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [overdueData, popularData] = await Promise.all([
          reportsApi.overdueBooks(),
          reportsApi.popularGenres(),
        ]);
        setOverdue(overdueData);
        setPopular(popularData);
        
        // Calculate summary stats
        let totalOverdueCount = overdueData.length;
        let mostPopular = "";
        let highestCount = 0;
        
        popularData.forEach(genre => {
          if (genre.borrow_count > highestCount) {
            highestCount = genre.borrow_count;
            mostPopular = genre.genre_name;
          }
        });
        
        setSummary({
          totalOverdue: totalOverdueCount,
          mostPopularGenre: mostPopular,
          highestBorrowCount: highestCount
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load reports.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getDaysOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 via-teal-800/50 to-cyan-900/50 backdrop-blur-sm border border-white/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
            <p className="mt-0.5 text-sm text-amber-100/70">
              Library performance insights and activity tracking
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 backdrop-blur-sm border border-rose-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-200">Overdue Books</p>
                <p className="mt-2 text-3xl font-bold text-white">{summary.totalOverdue}</p>
              </div>
              <div className="text-3xl text-rose-300">⚠️</div>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-rose-500/30">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (summary.totalOverdue / 20) * 100)}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-rose-200/70">
              {summary.totalOverdue === 0 ? "✓ All books returned on time" : `${summary.totalOverdue} book(s) need attention`}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-200">Most Popular Genre</p>
                <p className="mt-2 text-2xl font-bold text-white truncate">
                  {summary.mostPopularGenre || "N/A"}
                </p>
              </div>
              <div className="text-3xl text-emerald-300">🏆</div>
            </div>
            {summary.highestBorrowCount > 0 && (
              <p className="mt-2 text-xs text-emerald-200/70">
                {summary.highestBorrowCount} borrows in total
              </p>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Total Genres</p>
                <p className="mt-2 text-3xl font-bold text-white">{popular.length}</p>
              </div>
              <div className="text-3xl text-blue-300">📚</div>
            </div>
            <p className="mt-2 text-xs text-blue-200/70">
              Different genres in your collection
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 p-4">
          <div className="flex items-center gap-2">
            <span className="text-rose-300">⚠️</span>
            <p className="text-sm font-medium text-rose-200">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-sm text-white/60">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Overdue Books Section */}
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
            <div className="border-b border-white/20 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <h3 className="text-lg font-semibold text-white">Overdue Books</h3>
                {overdue.length > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                    {overdue.length} overdue
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/50">
                Books that haven't been returned by their due date
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {overdue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="mb-3 text-5xl opacity-50">✅</span>
                  <p className="text-white/60">No overdue books</p>
                  <p className="text-sm text-white/40 mt-1">
                    All books have been returned on time!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {overdue.map((row) => {
                    const daysOverdue = getDaysOverdue(row.due_date);
                    return (
                      <div key={row.id} className="p-4 transition hover:bg-white/5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {row.books?.title || "Unknown Book"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs">
                              <span className="text-amber-200/70">
                                👤 {row.members?.full_name || "Unknown Member"}
                              </span>
                              <span className="text-orange-200/70">
                                📅 Due: {formatDate(row.due_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              daysOverdue > 30 ? 'bg-rose-500/30 text-rose-300' :
                              daysOverdue > 14 ? 'bg-orange-500/30 text-orange-300' :
                              'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {daysOverdue} day(s) overdue
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Popular Genres Section */}
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
            <div className="border-b border-white/20 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="text-lg font-semibold text-white">Popular Genres</h3>
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  Top borrowed
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">
                Most borrowed book genres in your library
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {popular.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="mb-3 text-5xl opacity-50">📊</span>
                  <p className="text-white/60">No genre statistics available</p>
                  <p className="text-sm text-white/40 mt-1">
                    Start borrowing books to see insights
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {popular.map((row, index) => {
                    const maxBorrow = Math.max(...popular.map(g => g.borrow_count), 1);
                    const percentage = (row.borrow_count / maxBorrow) * 100;
                    
                    return (
                      <div key={row.genre_name} className="p-4 transition hover:bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📖"}
                            </span>
                            <span className="font-medium text-white">{row.genre_name}</span>
                          </div>
                          <span className="text-sm font-bold text-amber-300">
                            {row.borrow_count} borrows
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Section */}
      {!loading && !error && (overdue.length > 0 || popular.length > 0) && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-semibold text-white">Insights & Recommendations</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {overdue.length > 0 && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-sm text-amber-200">
                  📢 {overdue.length} book(s) are overdue. Consider sending reminder notifications to members.
                </p>
              </div>
            )}
            {popular.length > 0 && summary.mostPopularGenre && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-sm text-emerald-200">
                  🎯 "{summary.mostPopularGenre}" is your most popular genre. Consider adding more books in this category.
                </p>
              </div>
            )}
            {overdue.length === 0 && popular.length > 0 && (
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                <p className="text-sm text-blue-200">
                  ✅ Great job! No overdue books. Your library is running efficiently.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ReportsPage;