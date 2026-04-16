import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/books", label: "Books", icon: "📚" },
  { to: "/borrows", label: "Borrow/Return", icon: "🔄" },
  { to: "/members", label: "Members", icon: "👥" },
  { to: "/staff", label: "Staff", icon: "👨‍💼" },
  { to: "/reports", label: "Reports", icon: "📈" },
  { to: "/genres", label: "Genres", icon: "🏷️" },
];

function Sidebar({ onCollapseChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // For mobile drawer

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, sidebar is hidden by default (drawer mode)
        setIsOpen(false);
        setCollapsed(false);
        onCollapseChange?.(false);
      } else {
        // On desktop, sidebar is expanded by default
        setIsOpen(true);
        setCollapsed(false);
        onCollapseChange?.(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle drawer open/close
      setIsOpen(!isOpen);
    } else {
      // On desktop, toggle collapsed state
      const newState = !collapsed;
      setCollapsed(newState);
      onCollapseChange?.(newState);
      
      window.dispatchEvent(new CustomEvent('sidebarToggle', { 
        detail: { collapsed: newState } 
      }));
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // Don't render on mobile if not open
  if (isMobile && !isOpen) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg lg:hidden"
        >
          <span className="text-xl">📚</span>
        </button>
        
        {/* Overlay when sidebar is closed */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Mobile menu button when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg lg:hidden"
        >
          <span className="text-xl">📚</span>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen flex-col transition-all duration-300 ease-in-out
          bg-theme-card backdrop-blur-xl border-r border-theme-border shadow-2xl
          ${isMobile 
            ? `${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
            : `${collapsed ? "w-20" : "w-64"}`
          }
        `}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRightColor: 'var(--border-color)'
        }}
      >
        {/* Header with Logo and Toggle Button */}
        <div className="relative border-b border-theme-border p-4" style={{ borderBottomColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            {(!collapsed || isMobile) && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-theme-primary">Library LMS</h1>
                  <p className="text-[10px] text-theme-secondary">Management System</p>
                </div>
              </div>
            )}
            {(collapsed && !isMobile) && (
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <span className="text-lg">📚</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${
                (collapsed && !isMobile) ? "mx-auto mt-2" : ""
              } h-8 w-8 text-theme-secondary hover:text-theme-primary`}
            >
              <span className="text-xl">
                {isMobile 
                  ? "✕" 
                  : collapsed 
                    ? "→" 
                    : "←"
                }
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg"
                    : "text-theme-secondary hover:bg-white/10 hover:text-theme-primary"
                } ${(collapsed && !isMobile) ? "justify-center" : ""}`
              }
              title={(collapsed && !isMobile) ? item.label : ""}
            >
              <span className="text-xl">{item.icon}</span>
              {((!collapsed || isMobile)) && <span>{item.label}</span>}
              {(collapsed && !isMobile) && (
                <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
      </aside>
    </>
  );
}

export default Sidebar;