import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="p-4 md:p-5">
        <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Library Management System</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome, {user?.full_name || user?.email || "User"}
            </p>
          </div>
          <button
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
            onClick={logout}
          >
            Logout
          </button>
        </header>
        <section className="grid gap-4">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AppLayout;
