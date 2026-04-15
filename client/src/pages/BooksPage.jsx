import { useEffect, useState } from "react";
import { booksApi, genresApi } from "../services/api";

const initialForm = {
  title: "",
  author: "",
  isbn: "",
  total_copies: 1,
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

  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      const data = await booksApi.list({ q: query, genre });
      setBooks(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      await loadBooks();
      genresApi.list().then(setGenres).catch(() => setGenres([]));
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitBook(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await booksApi.update(editingId, form);
      } else {
        await booksApi.create(form);
      }
      setForm(initialForm);
      setEditingId(null);
      loadBooks();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save book.");
    }
  }

  function editBook(book) {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      total_copies: book.total_copies || 1,
      available_copies: book.available_copies || 1,
      genre_id: book.genre_id || "",
    });
  }

  async function deleteBook(id) {
    if (!window.confirm("Delete this book?")) return;
    try {
      await booksApi.remove(id);
      loadBooks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete book.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Books</h2>
        <p className="mt-1 text-sm text-slate-500">Search, add, edit, and remove books.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-56 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Search title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={loadBooks}
        >
          Search
        </button>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={submitBook}
      >
        <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">
          {editingId ? "Edit Book" : "Add Book"}
        </h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="ISBN"
          value={form.isbn}
          onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          type="number"
          min="0"
          placeholder="Total copies"
          value={form.total_copies}
          onChange={(e) => setForm((p) => ({ ...p, total_copies: Number(e.target.value) }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          type="number"
          min="0"
          placeholder="Available copies"
          value={form.available_copies}
          onChange={(e) =>
            setForm((p) => ({ ...p, available_copies: Number(e.target.value) }))
          }
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={form.genre_id}
          onChange={(e) => setForm((p) => ({ ...p, genre_id: Number(e.target.value) || "" }))}
        >
          <option value="">Select Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 md:col-span-2 md:w-fit"
          type="submit"
        >
          {editingId ? "Update Book" : "Create Book"}
        </button>
      </form>

      {loading && <p className="text-sm text-slate-500">Loading books...</p>}
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Author</th>
              <th className="py-3 pr-4">Genre</th>
              <th className="py-3 pr-4">Available</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{book.title}</td>
                <td className="py-3 pr-4">{book.author}</td>
                <td className="py-3 pr-4">{book.genre_id || "-"}</td>
                <td className="py-3 pr-4">{book.available_copies}</td>
                <td className="py-3">
                  <button
                    className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => editBook(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => deleteBook(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!books.length && !loading && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="5">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BooksPage;
