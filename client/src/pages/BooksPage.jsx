import { useEffect, useState } from "react";
import { booksApi, genresApi } from "../services/api";

const initialForm = {
  title: "",
  author: "",
  isbn: "",
  available_copies: 1,
  genre_id: "",
};

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      const data = await booksApi.list({ q: query, genre });
      setBooks(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load books.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadBooks();
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query, genre]);

  useEffect(() => {
    async function bootstrap() {
      await loadBooks();
      try {
        const genresData = await genresApi.list();
        setGenres(genresData);
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    }
    bootstrap();
  }, []);

  async function submitBook(event) {
    event.preventDefault();
    
    // Validate form
    if (!form.title.trim()) {
      setError("Book title is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!form.author.trim()) {
      setError("Author name is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (form.available_copies < 0) {
      setError("Available copies cannot be negative");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Prepare data for API - send same value for total_copies and available_copies
      const bookData = {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn?.trim() || "",
        total_copies: Number(form.available_copies),  // Same as available
        available_copies: Number(form.available_copies),  // Same as total
        genre_id: form.genre_id ? Number(form.genre_id) : null,
      };

      if (editingId) {
        // Update existing book - send both fields
        await booksApi.update(editingId, bookData);
        setSuccess("Book updated successfully!");
      } else {
        // Create new book
        await booksApi.create(bookData);
        setSuccess("Book added successfully!");
      }
      
      // Reset form and close modal
      resetForm();
      closeModal();
      
      // Reload books list
      await loadBooks();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Unable to save book.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function editBook(book) {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      available_copies: book.available_copies || book.total_copies || 1,
      genre_id: book.genre_id || "",
    });
    setIsModalOpen(true);
  }

  async function deleteBook(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    setLoading(true);
    setError("");
    
    try {
      await booksApi.remove(id);
      setSuccess(`"${title}" has been deleted successfully!`);
      await loadBooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to delete book.";
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

  function getGenreLabel(book) {
    if (book.genre_name) return book.genre_name;
    const matchedGenre = genres.find((item) => item.id === book.genre_id);
    return matchedGenre?.name || "-";
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
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Books Collection</h2>
              <p className="mt-0.5 text-sm text-amber-100/70">
                Manage your library's book inventory
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <span>➕</span>
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-2.5 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                placeholder="Search by title, author, or ISBN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-64">
            <select
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="" className="bg-gray-800">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id} className="bg-gray-800">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
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
      {loading && books.length === 0 && (
        <div className="flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-sm text-white/60">Loading books...</p>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Decorative gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              
              <div className="relative p-5">
                {/* Book Icon */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editBook(book)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-amber-500/20 hover:text-amber-300"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteBook(book.id, book.title)}
                      className="rounded-lg bg-white/10 p-1.5 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Book Details */}
                <h3 className="mb-1 font-bold text-white line-clamp-1">{book.title}</h3>
                <p className="text-sm text-amber-200/70">by {book.author}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60">
                    {getGenreLabel(book)}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-white/50">Available Copies</p>
                    <p className="text-xl font-bold text-emerald-400">{book.available_copies}</p>
                  </div>
                </div>

                {book.isbn && (
                  <p className="mt-2 text-xs text-white/30">ISBN: {book.isbn}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-12 text-center">
          <span className="mb-3 text-5xl opacity-50">📚</span>
          <p className="text-white/60">No books found</p>
          <button
            onClick={openModal}
            className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
          >
            Add your first book
          </button>
        </div>
      )}

      {/* Modal Popup for Add/Edit Book */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 border border-white/20 shadow-2xl">
              <div className="border-b border-white/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                      <span className="text-xl">{editingId ? "✏️" : "➕"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {editingId ? "Edit Book" : "Add New Book"}
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

              <form onSubmit={submitBook} className="p-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    placeholder="Enter book title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Author <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    required
                    placeholder="Enter author name"
                    value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">ISBN</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    placeholder="ISBN (optional)"
                    value={form.isbn}
                    onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Number of Copies <span className="text-amber-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    type="number"
                    min="0"
                    required
                    placeholder="Enter number of copies"
                    value={form.available_copies}
                    onChange={(e) => setForm((p) => ({ ...p, available_copies: Number(e.target.value) }))}
                  />
                  <p className="mt-1 text-xs text-white/40">
                    Total copies available in the library
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">Genre</label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                    value={form.genre_id}
                    onChange={(e) => setForm((p) => ({ ...p, genre_id: e.target.value ? Number(e.target.value) : "" }))}
                  >
                    <option value="" className="bg-gray-800">Select Genre</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id} className="bg-gray-800">
                        {g.name}
                      </option>
                    ))}
                  </select>
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
                      editingId ? "Update Book" : "Create Book"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
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
      `}</style>
    </div>
  );
}

export default BooksPage;