"use client";

import { useSidebar } from "./SidebarProvider";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebar();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`main-content flex-1 flex flex-col ${collapsed ? "sidebar-collapsed" : ""}`}>
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
        <footer
          className="px-6 pt-8 pb-5 border-t"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div
            className="rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(140deg, color-mix(in srgb, var(--blue-lighter) 20%, var(--background)), var(--background))",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">
              <div>
                <p className="text-sm font-semibold tracking-[0.14em]" style={{ color: "var(--text-primary)" }}>
                  REVENOX
                </p>
                <p className="text-xs mt-2 leading-5" style={{ color: "var(--text-secondary)" }}>
                  AI-powered revenue workspace built for deal velocity, pipeline visibility,
                  and smarter human decisions.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Platform status: Operational
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href="#"
                    className="text-xs px-3 py-1.5 rounded-md font-medium"
                    style={{ background: "var(--blue-primary)", color: "var(--text-inverse)" }}
                  >
                    Request Demo
                  </a>
                  <a
                    href="#"
                    className="text-xs px-3 py-1.5 rounded-md font-medium border"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
                  >
                    Contact Sales
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-light)" }}>
                  Product
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Link href="/" className="hover:underline">Dashboard</Link>
                  <Link href="/pipeline" className="hover:underline">Pipeline</Link>
                  <Link href="/deals" className="hover:underline">Deals</Link>
                  <Link href="/prospects" className="hover:underline">Prospects</Link>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-light)" }}>
                  Solutions
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <a href="#" className="hover:underline">Revenue Forecasting</a>
                  <a href="#" className="hover:underline">Pipeline Intelligence</a>
                  <a href="#" className="hover:underline">Deal Risk Scoring</a>
                  <a href="#" className="hover:underline">AI Sales Assistant</a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-light)" }}>
                  Resources
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <a href="#" className="hover:underline">Documentation</a>
                  <a href="#" className="hover:underline">API Reference</a>
                  <a href="#" className="hover:underline">Integration Guides</a>
                  <a href="#" className="hover:underline">Security & Compliance</a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-light)" }}>
                  Company
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <a href="#" className="hover:underline">About</a>
                  <a href="#" className="hover:underline">Careers</a>
                  <a href="#" className="hover:underline">Partners</a>
                  <a href="#" className="hover:underline">Press Kit</a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <p>{`© ${year} REVENOX. All rights reserved.`}</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Cookie Settings</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
