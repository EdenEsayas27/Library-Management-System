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
  const [error, setError] = useState("");

  async function loadStaff() {
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load staff. Ensure GET /api/staff is implemented."
      );
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const data = await staffApi.list();
        setStaff(data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load staff. Ensure GET /api/staff is implemented."
        );
      }
    }
    bootstrap();
  }, []);

  async function createStaff(event) {
    event.preventDefault();
    setError("");
    try {
      await staffApi.create(form);
      setForm(initialForm);
      loadStaff();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create staff.");
    }
  }

  async function removeStaff(id) {
    if (!window.confirm("Delete this staff account?")) return;
    try {
      await staffApi.remove(id);
      loadStaff();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete staff.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Staff</h2>
        <p className="mt-1 text-sm text-slate-500">Create and manage admin and librarian accounts.</p>
      </div>
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={createStaff}
      >
        <h3 className="text-lg font-semibold text-slate-900">Add Staff</h3>
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
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
        >
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" type="submit">
          Create Staff
        </button>
      </form>

      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">{member.full_name}</td>
                <td className="py-3 pr-4">{member.email}</td>
                <td className="py-3 pr-4">{member.role}</td>
                <td className="py-3">
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => removeStaff(member.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!staff.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="4">
                  No staff rows returned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffPage;
