import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider } from "./components/SidebarProvider";
import DashboardLayout from "./components/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REVENOX — AI Sales Co-pilot",
  description:
    "A human-in-the-loop AI sales assistant that analyzes conversations in real time and suggests optimized actions to improve pipeline conversion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <SidebarProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
