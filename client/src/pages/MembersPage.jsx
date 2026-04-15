import { useEffect, useState } from "react";
import { membersApi } from "../services/api";

const initialForm = { full_name: "", email: "", phone: "" };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitMember(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await membersApi.update(editingId, form);
      } else {
        await membersApi.create(form);
      }
      setForm(initialForm);
      setEditingId(null);
      loadMembers();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save member.");
    }
  }

  function editMember(member) {
    setEditingId(member.id);
    setForm({
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
    });
  }

  async function removeMember(id) {
    if (!window.confirm("Delete this member?")) return;
    try {
      await membersApi.remove(id);
      loadMembers();
      setHistory([]);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete member.");
    }
  }

  async function showHistory(id) {
    try {
      const data = await membersApi.history(id);
      setHistory(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load member history.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Members</h2>
        <p className="mt-1 text-sm text-slate-500">Manage members and review borrowing history.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-56 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Search members..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={loadMembers}
        >
          Search
        </button>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={submitMember}
      >
        <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">
          {editingId ? "Edit Member" : "Add Member"}
        </h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 md:w-fit"
          type="submit"
        >
          {editingId ? "Update Member" : "Create Member"}
        </button>
      </form>

      {loading && <p className="text-sm text-slate-500">Loading members...</p>}
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Phone</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{member.full_name}</td>
                <td className="py-3 pr-4">{member.email}</td>
                <td className="py-3 pr-4">{member.phone || "-"}</td>
                <td className="py-3">
                  <button
                    className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => editMember(member)}
                  >
                    Edit
                  </button>
                  <button
                    className="mr-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    onClick={() => showHistory(member.id)}
                  >
                    History
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => removeMember(member.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!members.length && !loading && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="4">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Borrowing History</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Book</th>
              <th className="py-3 pr-4">Borrowed At</th>
              <th className="py-3 pr-4">Due Date</th>
              <th className="py-3">Returned At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{record.books?.title || "-"}</td>
                <td className="py-3 pr-4">{record.borrowed_at}</td>
                <td className="py-3 pr-4">{record.due_date}</td>
                <td className="py-3">{record.returned_at || "Not returned"}</td>
              </tr>
            ))}
            {!history.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="4">
                  Select a member and click History.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembersPage;
