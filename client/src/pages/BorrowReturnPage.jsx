import { useState } from "react";
import { borrowsApi } from "../services/api";

function BorrowReturnPage() {
  const [borrowForm, setBorrowForm] = useState({
    book_id: "",
    member_id: "",
    due_date: "",
  });
  const [returnId, setReturnId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function borrowBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await borrowsApi.create({
        ...borrowForm,
        book_id: Number(borrowForm.book_id),
        member_id: Number(borrowForm.member_id),
      });
      setMessage("Book borrowed successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Borrow request failed.");
    }
  }

  async function returnBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await borrowsApi.returnBook(returnId);
      setMessage("Book returned successfully.");
      setReturnId("");
    } catch (err) {
      setError(err?.response?.data?.message || "Return request failed.");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Borrow / Return</h2>
        <p className="mt-1 text-sm text-slate-500">Borrow books and close open borrow records.</p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={borrowBook}
      >
        <h3 className="text-lg font-semibold text-slate-900">Borrow Book</h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          type="number"
          min="1"
          placeholder="Book ID"
          value={borrowForm.book_id}
          onChange={(e) => setBorrowForm((p) => ({ ...p, book_id: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          type="number"
          min="1"
          placeholder="Member ID"
          value={borrowForm.member_id}
          onChange={(e) => setBorrowForm((p) => ({ ...p, member_id: e.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          type="datetime-local"
          value={borrowForm.due_date}
          onChange={(e) => setBorrowForm((p) => ({ ...p, due_date: e.target.value }))}
        />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Borrow
        </button>
      </form>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={returnBook}
      >
        <h3 className="text-lg font-semibold text-slate-900">Return Book</h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          required
          type="number"
          min="1"
          placeholder="Borrow Record ID"
          value={returnId}
          onChange={(e) => setReturnId(e.target.value)}
        />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Return
        </button>
      </form>

      {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
      <p className="text-sm text-slate-500">
        Borrow validation (available copies) is enforced by the backend.
      </p>
    </div>
  );
}

export default BorrowReturnPage;
