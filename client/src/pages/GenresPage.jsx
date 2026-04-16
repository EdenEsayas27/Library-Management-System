import { useEffect, useState } from "react";
import { genresApi } from "../services/api";

function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState(null);

  async function loadGenres() {
    setLoading(true);
    setError("");
    try {
      const data = await genresApi.list();
      setGenres(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load genres.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGenres();
  }, []);

  async function submitGenre(event) {
    event.preventDefault();
    
    if (!name.trim()) {
      setError("Genre name is required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      if (editingId) {
        await genresApi.update(editingId, { name: name.trim() });
        setSuccess("Genre updated successfully!");
      } else {
        await genresApi.create({ name: name.trim() });
        setSuccess("Genre added successfully!");
      }
      
      resetForm();
      closeModal();
      await loadGenres();
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err?.response?.data?.message || "Failed to save genre.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function editGenre(genre) {
    setEditingId(genre.id);
    setName(genre.name);
    setIsModalOpen(true);
  }

  function confirmDelete(genre) {
    setGenreToDelete(genre);
    setIsDeleteModalOpen(true);
  }

  async function deleteGenre() {
    if (!genreToDelete) return;
    
    setLoading(true);
    setError("");
    
    try {
      await genresApi.remove(genreToDelete.id);
      setSuccess(`"${genreToDelete.name}" has been deleted successfully!`);
      await loadGenres();
      setIsDeleteModalOpen(false);
      setGenreToDelete(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to delete genre.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
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

  // Get gradient color based on genre name
  function getGenreGradient(name) {
    const gradients = [
      "from-rose-500/20 to-pink-500/20",
      "from-blue-500/20 to-cyan-500/20",
      "from-emerald-500/20 to-teal-500/20",
      "from-purple-500/20 to-indigo-500/20",
      "from-orange-500/20 to-amber-500/20",
      "from-red-500/20 to-orange-500/20",
    ];
    const index = name.length % gradients.length;
    return gradients[index];
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
              <span className="text-2xl">🏷️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Book Genres</h2>
              <p className="mt-0.5 text-sm text-amber-100/70">
                Manage book categories used across the library system
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <span>➕</span>
            <span>Add New Genre</span>
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
      {loading && genres.length === 0 && (
        <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-sm text-white/60">Loading genres...</p>
          </div>
        </div>
      )}

      {/* Genres Grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${getGenreGradient(genre.name)} backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              
              <div className="relative p-5">
                {/* Action Buttons */}
                <div className="mb-3 flex items-center justify-end">
                  <div className="flex gap-1">
                    <button
                      onClick={() => editGenre(genre)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-amber-500/20 hover:text-amber-300"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(genre)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Genre Details */}
                <h3 className="mb-1 font-bold text-white text-xl text-center line-clamp-2">
                  {genre.name}
                </h3>
                
                <div className="mt-4 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Genre ID</span>
                    <span className="text-white/50">#{genre.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && genres.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12 text-center">
          <span className="mb-3 text-5xl opacity-50">🏷️</span>
          <p className="text-white/60">No genres found</p>
          <p className="text-sm text-white/40 mt-1">
            Add your first genre to organize your books
          </p>
          <button
            onClick={openModal}
            className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
          >
            Add your first genre
          </button>
        </div>
      )}

      {/* Add/Edit Genre Modal */}
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
                      {editingId ? "Edit Genre" : "Add New Genre"}
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

              <form onSubmit={submitGenre} className="p-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Genre Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    placeholder="e.g., Fiction, Mystery, Science Fiction"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-white/40">
                    Choose a unique name for the book category
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
                      editingId ? "Update Genre" : "Create Genre"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && genreToDelete && (
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
                    Are you sure you want to delete <span className="font-bold text-amber-300">"{genreToDelete.name}"</span>?
                  </p>
                  <p className="text-sm text-white/50">
                    This action cannot be undone. Books using this genre will need to be reassigned.
                  </p>
                  {genreToDelete.books_count > 0 && (
                    <p className="mt-2 text-xs text-amber-300/70">
                      ⚠️ Warning: {genreToDelete.books_count} book(s) are using this genre.
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
                    onClick={deleteGenre}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Deleting...
                      </span>
                    ) : (
                      "Yes, Delete Genre"
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default GenresPage;