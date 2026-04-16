import { useEffect, useState } from "react";
import { booksApi, membersApi, borrowsApi } from "../services/api";

function BorrowReturnPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [borrowForm, setBorrowForm] = useState({
    book_id: "",
    member_id: "",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  async function loadBooks() {
    try {
      const data = await booksApi.list({});
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  }

  async function loadMembers() {
    try {
      const data = await membersApi.list({});
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  }

  async function loadActiveBorrows() {
    setLoading(true);
    try {
      const overdueData = await borrowsApi.overdue();
      console.log("Overdue borrows:", overdueData);
      
      const allActiveBorrows = [...overdueData];
      
      const allMembers = await membersApi.list({});
      
      for (const member of allMembers) {
        try {
          const history = await membersApi.history(member.id);
          const memberActiveBorrows = history.filter(borrow => !borrow.returned_at);
          
          for (const borrow of memberActiveBorrows) {
            const exists = allActiveBorrows.some(b => b.id === borrow.id);
            if (!exists) {
              allActiveBorrows.push({
                ...borrow,
                books: { title: borrow.books?.title || borrow.book_title },
                members: { full_name: member.full_name }
              });
            }
          }
        } catch (err) {
          console.error(`Failed to get history for member ${member.id}:`, err);
        }
      }
      
      console.log("All active borrows:", allActiveBorrows);
      setActiveBorrows(allActiveBorrows);
    } catch (err) {
      console.error("Failed to load active borrows:", err);
      setError("Failed to load active borrowings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
    loadMembers();
    loadActiveBorrows();
  }, []);

  async function borrowBook(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    
    if (!borrowForm.book_id || !borrowForm.member_id || !borrowForm.due_date) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const dueDate = new Date(borrowForm.due_date);
      const borrowedAt = new Date();
      
      const borrowData = {
        book_id: Number(borrowForm.book_id),
        member_id: Number(borrowForm.member_id),
        due_date: dueDate.toISOString(),
        borrowed_at: borrowedAt.toISOString(),
      };
      
      console.log("Borrowing data being sent:", borrowData);
      
      await borrowsApi.create(borrowData);
      
      setSuccess("Book borrowed successfully!");
      setBorrowForm({ book_id: "", member_id: "", due_date: "" });
      setIsBorrowModalOpen(false);
      
      await Promise.all([
        loadBooks(),
        loadActiveBorrows()
      ]);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Borrow error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Borrow request failed.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function returnBook(borrowId) {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Returning borrow ID:", borrowId);
      
      await borrowsApi.returnBook(borrowId);
      
      setSuccess("Book returned successfully!");
      
      await Promise.all([
        loadBooks(),
        loadActiveBorrows()
      ]);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Return error:", err);
      setError(err.response?.data?.message || err.message || "Return request failed.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getDaysRemaining(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function isOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  function getBookTitle(borrow) {
    if (borrow.books?.title) return borrow.books.title;
    const book = books.find(b => b.id === borrow.book_id);
    return book?.title || `Book #${borrow.book_id}`;
  }

  function getMemberName(borrow) {
    if (borrow.members?.full_name) return borrow.members.full_name;
    const member = members.find(m => m.id === borrow.member_id);
    return member?.full_name || `Member #${borrow.member_id}`;
  }

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 16);
  };

  // Count overdue books
  const overdueCount = activeBorrows.filter(borrow => isOverdue(borrow.due_date)).length;

  return (
    <div className="space-y-6">
      {/* Success Message Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30 px-4 py-3 shadow-xl">
            <span className="text-lg">✅</span>
            <p className="text-sm font-medium text-white">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="ml-2 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 via-teal-800/50 to-cyan-900/50 backdrop-blur-sm border border-white/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Borrow / Return</h2>
              <p className="mt-0.5 text-sm text-amber-100/70">
                Manage book borrowing and returns
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setBorrowForm({ ...borrowForm, due_date: getDefaultDueDate() });
              setIsBorrowModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <span>📖</span>
            <span>New Borrowing</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 p-4">
          <div className="flex items-center gap-2">
            <span className="text-rose-300">⚠️</span>
            <p className="text-sm font-medium text-rose-200">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200">Active Borrowings</p>
              <p className="mt-2 text-3xl font-bold text-white">{activeBorrows.length}</p>
            </div>
            <div className="text-3xl text-blue-300">📚</div>
          </div>
          <p className="mt-2 text-xs text-blue-200/70">
            Currently borrowed books
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 backdrop-blur-sm border border-rose-500/30 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-200">Overdue Books</p>
              <p className="mt-2 text-3xl font-bold text-white">{overdueCount}</p>
            </div>
            <div className="text-3xl text-rose-300">⚠️</div>
          </div>
          <p className="mt-2 text-xs text-rose-200/70">
            {overdueCount === 0 ? "No overdue books" : `${overdueCount} book(s) need attention`}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-200">Available Books</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {books.filter(b => b.available_copies > 0).length}
              </p>
            </div>
            <div className="text-3xl text-emerald-300">📖</div>
          </div>
          <p className="mt-2 text-xs text-emerald-200/70">
            Out of {books.length} total books
          </p>
        </div>
      </div>

      {/* Active Borrows List */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
        <div className="border-b border-white/20 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="text-lg font-semibold text-white">Active Borrowings</h3>
            {activeBorrows.length > 0 && (
              <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                {activeBorrows.length} active
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50">
            Books that are currently borrowed and not yet returned
          </p>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {loading && activeBorrows.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
                <p className="text-sm text-white/60">Loading borrowings...</p>
              </div>
            </div>
          ) : activeBorrows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 text-5xl opacity-50">📚</span>
              <p className="text-white/60">No active borrowings</p>
              <p className="text-sm text-white/40 mt-1">
                All books have been returned
              </p>
              <button
                onClick={() => {
                  setBorrowForm({ ...borrowForm, due_date: getDefaultDueDate() });
                  setIsBorrowModalOpen(true);
                }}
                className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
              >
                Borrow a Book
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {activeBorrows.map((borrow) => {
                const daysRemaining = getDaysRemaining(borrow.due_date);
                const overdue = isOverdue(borrow.due_date);
                
                return (
                  <div 
                    key={borrow.id} 
                    className={`p-4 transition hover:bg-white/5 ${overdue ? 'bg-rose-500/5' : ''}`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-lg ${
                            overdue 
                              ? 'bg-gradient-to-br from-rose-500 to-red-500' 
                              : 'bg-gradient-to-br from-amber-400 to-orange-500'
                          }`}>
                            <span className="text-lg">{overdue ? '⚠️' : '📖'}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-white">
                                {getBookTitle(borrow)}
                              </p>
                              {overdue && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 px-2 py-0.5 text-xs font-semibold text-rose-300 animate-pulse">
                                  <span>⚠️</span> OVERDUE
                                </span>
                              )}
                              {!overdue && daysRemaining <= 3 && daysRemaining > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/30 px-2 py-0.5 text-xs font-semibold text-yellow-300">
                                  <span>⏰</span> Due soon
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              <span className="text-amber-200/70">
                                👤 Member: {getMemberName(borrow)}
                              </span>
                              <span className="text-white/50">
                                📅 Borrowed: {formatDate(borrow.borrowed_at)}
                              </span>
                              <span className={`flex items-center gap-1 ${
                                overdue ? 'text-rose-300 font-semibold' : 'text-orange-200/70'
                              }`}>
                                ⏰ Due: {formatDate(borrow.due_date)}
                                {overdue && (
                                  <span className="ml-1 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-xs">
                                    {Math.abs(daysRemaining)} days overdue
                                  </span>
                                )}
                                {!overdue && daysRemaining <= 3 && daysRemaining > 0 && (
                                  <span className="ml-1 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-xs">
                                    {daysRemaining} days left
                                  </span>
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-white/30">
                              Borrow ID: #{borrow.id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-13 lg:pl-0">
                        <button
                          onClick={() => returnBook(borrow.id)}
                          disabled={loading}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30 hover:text-emerald-200 disabled:opacity-50"
                        >
                          <span>✅</span>
                          <span>Mark as Returned</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Borrow Book Modal */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsBorrowModalOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 border border-white/20 shadow-2xl">
              <div className="border-b border-white/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                      <span className="text-xl">📖</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Borrow a Book</h3>
                  </div>
                  <button
                    onClick={() => setIsBorrowModalOpen(false)}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={borrowBook} className="p-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Select Book <span className="text-amber-400">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    value={borrowForm.book_id}
                    onChange={(e) => setBorrowForm((p) => ({ ...p, book_id: e.target.value }))}
                  >
                    <option value="" className="bg-gray-800">Choose a book...</option>
                    {books
                      .filter(book => book.available_copies > 0)
                      .map((book) => (
                        <option key={book.id} value={book.id} className="bg-gray-800">
                          {book.title} by {book.author} ({book.available_copies} available)
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-white/40">
                    Only books with available copies are shown
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Select Member <span className="text-amber-400">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    value={borrowForm.member_id}
                    onChange={(e) => setBorrowForm((p) => ({ ...p, member_id: e.target.value }))}
                  >
                    <option value="" className="bg-gray-800">Choose a member...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id} className="bg-gray-800">
                        {member.full_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Due Date <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    type="datetime-local"
                    value={borrowForm.due_date}
                    onChange={(e) => setBorrowForm((p) => ({ ...p, due_date: e.target.value }))}
                  />
                  <p className="mt-1 text-xs text-white/40">
                    Set the date when the book should be returned (typically 14 days from today)
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBorrowModalOpen(false)}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Processing...
                      </span>
                    ) : (
                      "Confirm Borrow"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .zoom-in {
          animation-name: zoom-in;
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .pl-13 {
          padding-left: 3.25rem;
        }
      `}</style>
    </div>
  );
}

export default BorrowReturnPage;