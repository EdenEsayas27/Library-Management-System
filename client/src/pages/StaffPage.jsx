import { useEffect, useState } from "react";
import { staffApi } from "../services/api";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  role: "librarian",
};

function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  async function loadStaff() {
    setLoading(true);
    setError("");
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load staff. Ensure GET /api/staff is implemented."
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function submitStaff(event) {
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
    
    if (!editingId && !form.password) {
      setError("Password is required for new staff");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const staffData = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      
      // Only include password if it's provided (for new staff or password change)
      if (form.password) {
        staffData.password = form.password;
      }

      if (editingId) {
        await staffApi.update(editingId, staffData);
        setSuccess("Staff member updated successfully!");
      } else {
        await staffApi.create(staffData);
        setSuccess("Staff member added successfully!");
      }
      
      resetForm();
      closeModal();
      await loadStaff();
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err?.response?.data?.message || "Unable to save staff member.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function editStaff(member) {
    setEditingId(member.id);
    setForm({
      full_name: member.full_name || "",
      email: member.email || "",
      password: "", // Don't populate password for security
      role: member.role || "librarian",
    });
    setIsModalOpen(true);
  }

  function confirmDelete(staff) {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  }

  async function deleteStaff() {
    if (!staffToDelete) return;
    
    setLoading(true);
    setError("");
    
    try {
      await staffApi.remove(staffToDelete.id);
      setSuccess(`"${staffToDelete.full_name}" has been deleted successfully!`);
      await loadStaff();
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to delete staff member.";
      setError(errorMessage);
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

  function getRoleBadge(role) {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
          <span>👑</span> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
        <span>📚</span> Librarian
      </span>
    );
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
              <span className="text-2xl">👨‍💼</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Staff Management</h2>
              <p className="mt-0.5 text-sm text-amber-100/70">
                Manage admin and librarian accounts
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <span>➕</span>
            <span>Add New Staff</span>
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

      {/* Loading State */}
      {loading && staff.length === 0 && (
        <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-sm text-white/60">Loading staff...</p>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              
              <div className="relative p-5">
                {/* Staff Avatar */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <span className="text-2xl">
                      {member.full_name?.charAt(0).toUpperCase() || "👤"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editStaff(member)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-amber-500/20 hover:text-amber-300"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(member)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Staff Details */}
                <h3 className="mb-1 font-bold text-white line-clamp-1">{member.full_name}</h3>
                <p className="text-sm text-amber-200/70 break-all">{member.email}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  {getRoleBadge(member.role)}
                  <div className="text-right">
                    <p className="text-xs text-white/40">Staff ID</p>
                    <p className="text-xs text-white/50">#{member.id}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && staff.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12 text-center">
          <span className="mb-3 text-5xl opacity-50">👨‍💼</span>
          <p className="text-white/60">No staff members found</p>
          <button
            onClick={openModal}
            className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
          >
            Add your first staff member
          </button>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
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
                      {editingId ? "Edit Staff Member" : "Add New Staff Member"}
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

              <form onSubmit={submitStaff} className="p-5 space-y-4">
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
                    placeholder="staff@library.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Password {!editingId && <span className="text-amber-400">*</span>}
                    {editingId && <span className="text-xs text-white/40"> (Leave blank to keep current)</span>}
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    type="password"
                    placeholder={editingId ? "Enter new password (optional)" : "Enter password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  />
                  <p className="mt-1 text-xs text-white/40">
                    {editingId ? "Only fill if you want to change the password" : "Minimum 6 characters recommended"}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Role <span className="text-amber-400">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="librarian" className="bg-gray-800">📚 Librarian</option>
                    <option value="admin" className="bg-gray-800">👑 Admin</option>
                  </select>
                  <p className="mt-1 text-xs text-white/40">
                    Admins have full access, Librarians can manage books and members
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
                      editingId ? "Update Staff" : "Create Staff"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 border border-white/20 shadow-2xl">
              <div className="border-b border-white/20 p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                </div>
              </div>

              <div className="p-5">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
                      <span className="text-3xl">🗑️</span>
                    </div>
                  </div>
                  <p className="text-white mb-2">
                    Are you sure you want to delete <span className="font-bold text-amber-300">"{staffToDelete.full_name}"</span>?
                  </p>
                  <p className="text-sm text-white/50">
                    This action cannot be undone. The staff member will lose access to the system.
                  </p>
                  {staffToDelete.role === 'admin' && (
                    <p className="mt-2 text-xs text-amber-300/70">
                      ⚠️ Warning: This is an admin account. Deleting it may affect system management.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteStaff}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Deleting...
                      </span>
                    ) : (
                      "Yes, Delete Staff"
                    )}
                  </button>
                </div>
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

export default StaffPage;