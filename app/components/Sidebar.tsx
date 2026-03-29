"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
  HelpCircle,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/activity", label: "Activity Log", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 mb-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-lg tracking-tight">
            REVENOX
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="icon" />
                <span className="label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-0 py-3 border-t border-white/10">
        <Link href="#" className="sidebar-item" title={collapsed ? "Settings" : undefined}>
          <Settings className="icon" />
          <span className="label">Settings</span>
        </Link>
        <Link href="#" className="sidebar-item" title={collapsed ? "Help" : undefined}>
          <HelpCircle className="icon" />
          <span className="label">Help</span>
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="sidebar-item w-full mt-2"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="icon" />
          ) : (
            <ChevronLeft className="icon" />
          )}
          <span className="label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
