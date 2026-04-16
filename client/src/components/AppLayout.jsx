import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
import ThemeSwitcherSimple from "./ThemeSwitcherPortal";
import { useTheme } from '../hooks/useTheme';

function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  const getGradientClass = () => {
    const gradientMap = {
      light: 'from-gray-100 to-gray-300',
      dark: 'from-gray-800 to-gray-900',
      emerald: 'from-emerald-900 to-teal-800',
      forest: 'from-green-900 to-emerald-800',
      ocean: 'from-blue-900 to-cyan-800',
      sunset: 'from-orange-900 to-rose-800',
      purple: 'from-purple-900 to-fuchsia-800',
    };
    return gradientMap[theme] || 'from-emerald-900 to-teal-800';
  };

  return (
    <div className={`min-h-screen overflow-x-hidden bg-gradient-to-br ${getGradientClass()}`}>
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
      <main
        className={`transition-all duration-300 ease-in-out ${
          !isMobile && !sidebarCollapsed ? "md:ml-64" : !isMobile && sidebarCollapsed ? "md:ml-20" : "ml-0"
        } min-h-screen`}
      >
        <div className="p-4 md:p-6">
          <header className="mb-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {/* Add margin left on mobile to account for menu button */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg ${isMobile ? 'ml-10' : ''}`}>
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-theme-primary md:text-2xl">
                      Library Management System
                    </h1>
                    <p className="mt-0.5 text-sm text-theme-secondary">
                      Welcome back, {user?.full_name || user?.email || "Librarian"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeSwitcherSimple />
                
                <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                    <span className="text-sm font-bold text-white">
                      {user?.full_name?.[0] || user?.email?.[0] || "U"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-theme-primary">
                      {user?.full_name}
                    </p>
                    <p className="text-[10px] text-theme-secondary">
                      {user?.role || "Administrator"}
                    </p>
                  </div>
                </div>
                
                <button
                  className="flex items-center gap-2 rounded-lg bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-200 transition-all hover:bg-rose-500/30 hover:text-rose-100 border border-rose-500/30"
                  onClick={logout}
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm shadow-xl">
            <div className="p-5 md:p-6">
              <Outlet />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AppLayout;