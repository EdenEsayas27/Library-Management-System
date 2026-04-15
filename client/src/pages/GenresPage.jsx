import { useEffect, useState } from "react";
import { genresApi } from "../services/api";

function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadGenres() {
    try {
      const data = await genresApi.list();
      setGenres(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load genres.");
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const data = await genresApi.list();
        setGenres(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load genres.");
      }
    }
    bootstrap();
  }, []);

  async function submitGenre(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await genresApi.update(editingId, { name });
      } else {
        await genresApi.create({ name });
      }
      setEditingId(null);
      setName("");
      loadGenres();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save genre.");
    }
  }

  async function removeGenre(id) {
    if (!window.confirm("Delete this genre?")) return;
    try {
      await genresApi.remove(id);
      loadGenres();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete genre.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Genres</h2>
        <p className="mt-1 text-sm text-slate-500">Manage book categories used across the system.</p>
      </div>
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={submitGenre}
      >
        <h3 className="text-lg font-semibold text-slate-900">
          {editingId ? "Edit Genre" : "Add Genre"}
        </h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" type="submit">
          {editingId ? "Update" : "Create"}
        </button>
      </form>
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{genre.name}</td>
                <td className="py-3">
                  <button
                    className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => {
                      setEditingId(genre.id);
                      setName(genre.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => removeGenre(genre.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!genres.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="2">
                  No genres found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GenresPage;
