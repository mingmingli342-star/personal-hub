import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useStore } from "../stores/useStore";
import {
  LayoutDashboard, Wallet, Briefcase, Heart, Target,
  ChevronLeft, ChevronRight, Moon, Sun,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/assets", icon: Wallet, label: "资产管理" },
  { to: "/work", icon: Briefcase, label: "工作管理" },
  { to: "/health", icon: Heart, label: "身体与运动" },
  { to: "/plans", icon: Target, label: "规划管理" },
];

export default function MainLayout() {
  const { darkMode, toggleDarkMode, sidebarCollapsed, setSidebarCollapsed } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-[68px]" : "w-60"
        } hidden md:flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200 shrink-0`}
      >
        <div className="flex items-center h-16 px-4 border-b border-[hsl(var(--border))]">
          {!sidebarCollapsed && (
            <h1 className="font-bold text-lg whitespace-nowrap">
              <span className="text-[hsl(var(--primary))]">Personal</span> Hub
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
                }`
              }
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[hsl(var(--border))]">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!sidebarCollapsed && (darkMode ? "浅色模式" : "深色模式")}
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex justify-around py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1 text-[10px] rounded-lg transition-colors ${
                isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
