"use client";

import { useTheme } from "./ThemeProvider";
import { useSidebar } from "./SidebarProvider";
import { Sun, Moon, Bell, Search, Menu } from "lucide-react";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="btn-ghost p-2 rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-light)" }}
          />
          <input
            type="text"
            placeholder="Search deals, prospects..."
            className="input pl-9 w-64 text-sm"
            style={{ background: "var(--background)" }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Toggle theme"
          style={{ color: "var(--text-secondary)" }}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* User avatar */}
        <div className="ml-2 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: "var(--blue-primary)" }}
          >
            RV
          </div>
        </div>
      </div>
    </header>
  );
}
