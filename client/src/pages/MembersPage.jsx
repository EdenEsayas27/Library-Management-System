import { useEffect, useState } from "react";
import { membersApi } from "../services/api";

const initialForm = { full_name: "", email: "", phone: "" };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  async function loadMembers() {
    setLoading(true);
    setError("");
    try {
      const data = await membersApi.list({ q: query });
      setMembers(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load members. Make sure GET /api/members is available."
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadMembers();
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    loadMembers();
  }, []);

  async function submitMember(event) {
    event.preventDefault();
    
    // Validate form
    if (!form.full_name.trim()) {
      setError("Full name is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const memberData = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || "",
      };

      if (editingId) {
        await membersApi.update(editingId, memberData);
        setSuccess("Member updated successfully!");
      } else {
        await membersApi.create(memberData);
        setSuccess("Member added successfully!");
      }
      
      resetForm();
      closeModal();
      await loadMembers();
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err?.response?.data?.message || "Unable to save member.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function editMember(member) {
    setEditingId(member.id);
    setForm({
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
    });
    setIsModalOpen(true);
  }

  async function removeMember(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setLoading(true);
    setError("");
    
    try {
      await membersApi.remove(id);
      setSuccess(`"${name}" has been deleted successfully!`);
      await loadMembers();
      setHistory([]);
      setSelectedMember(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to delete member.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function showHistory(member) {
    setSelectedMember(member);
    setLoading(true);
    try {
      const data = await membersApi.history(member.id);
      setHistory(data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load member history.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function openModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
    setError("");
  }

  function closeHistoryModal() {
    setIsHistoryModalOpen(false);
    setHistory([]);
    setSelectedMember(null);
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

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
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Library Members</h2>
              <p className="mt-0.5 text-sm text-amber-100/70">
                Manage members and track borrowing history
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <span>➕</span>
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
          <input
            className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-2.5 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
            placeholder="Search members by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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

      {/* Loading State */}
      {loading && members.length === 0 && (
        <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-sm text-white/60">Loading members...</p>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              
              <div className="relative p-5">
                {/* Member Avatar */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <span className="text-2xl">
                      {member.full_name?.charAt(0).toUpperCase() || "👤"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editMember(member)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-amber-500/20 hover:text-amber-300"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => showHistory(member)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-blue-500/20 hover:text-blue-300"
                      title="History"
                    >
                      📜
                    </button>
                    <button
                      onClick={() => removeMember(member.id, member.full_name)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Member Details */}
                <h3 className="mb-1 font-bold text-white line-clamp-1">{member.full_name}</h3>
                <p className="text-sm text-amber-200/70 break-all">{member.email}</p>
                
                {member.phone && (
                  <p className="mt-2 text-xs text-white/50">📞 {member.phone}</p>
                )}

                <div className="mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => showHistory(member)}
                    className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    View Borrowing History →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && members.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12 text-center">
          <span className="mb-3 text-5xl opacity-50">👥</span>
          <p className="text-white/60">No members found</p>
          <button
            onClick={openModal}
            className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
          >
            Add your first member
          </button>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 border border-white/20 shadow-2xl">
              <div className="border-b border-white/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                      <span className="text-xl">{editingId ? "✏️" : "➕"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {editingId ? "Edit Member" : "Add New Member"}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={submitMember} className="p-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    placeholder="Enter full name"
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Email <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    type="email"
                    placeholder="member@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">Phone Number</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    placeholder="Enter phone number (optional)"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                  <p className="mt-1 text-xs text-white/40">
                    Contact number for the member
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-rose-500/20 p-2">
                    <p className="text-xs text-rose-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        {editingId ? "Updating..." : "Creating..."}
                      </span>
                    ) : (
                      editingId ? "Update Member" : "Create Member"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Borrowing History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeHistoryModal}
          ></div>
          
          <div className="relative w-full max-w-3xl max-h-[80vh] animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 border border-white/20 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="border-b border-white/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                      <span className="text-xl">📜</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Borrowing History</h3>
                      <p className="text-sm text-amber-100/70">{selectedMember?.full_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeHistoryModal}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="mb-3 text-5xl opacity-50">📖</span>
                    <p className="text-white/60">No borrowing history found</p>
                    <p className="text-sm text-white/40 mt-1">
                      This member hasn't borrowed any books yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-lg bg-white/5 border border-white/10 p-4 transition hover:bg-white/10"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {record.books?.title || "Unknown Book"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs">
                              <span className="text-amber-200/70">
                                📅 Borrowed: {formatDate(record.borrowed_at)}
                              </span>
                              <span className="text-orange-200/70">
                                ⏰ Due: {formatDate(record.due_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.returned_at ? (
                              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                                ✅ Returned {formatDate(record.returned_at)}
                              </span>
                            ) : (
                              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-300">
                                ⚠️ Not Returned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 p-4">
                <button
                  onClick={closeHistoryModal}
                  className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom animation styles */}
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
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default MembersPage;