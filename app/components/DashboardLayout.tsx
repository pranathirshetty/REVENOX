"use client";

import { useSidebar } from "./SidebarProvider";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`main-content flex-1 flex flex-col ${collapsed ? "sidebar-collapsed" : ""}`}>
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
