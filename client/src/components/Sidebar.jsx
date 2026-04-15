import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/books", label: "Books" },
  { to: "/borrows", label: "Borrow/Return" },
  { to: "/members", label: "Members" },
  { to: "/staff", label: "Staff" },
  { to: "/reports", label: "Reports" },
  { to: "/genres", label: "Genres" },
];

function Sidebar() {
  return (
    <aside className="bg-slate-950 p-4 text-slate-200 md:min-h-screen">
      <h2 className="mb-4 text-xl font-semibold">Library LMS</h2>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
