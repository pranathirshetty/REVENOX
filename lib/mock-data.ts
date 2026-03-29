import type { Lead } from "./types";

// Fallback mock leads — used when HubSpot API fails or returns empty
export const mockLeads: Lead[] = [
  {
    id: "mock-1",
    name: "Sarah Chen",
    email: "sarah.chen@techvault.io",
    company: "TechVault Inc.",
    phone: "+1 (415) 555-0142",
    stage: "Qualified Lead",
    lastContact: new Date(Date.now() - 2 * 86400000).toISOString(),
    jobtitle: "VP of Engineering",
  },
  {
    id: "mock-2",
    name: "Michael Brooks",
    email: "m.brooks@nexusfin.com",
    company: "Nexus Financial",
    phone: "+1 (212) 555-0198",
    stage: "New Lead",
    lastContact: new Date(Date.now() - 5 * 86400000).toISOString(),
    jobtitle: "CFO",
  },
  {
    id: "mock-3",
    name: "Emily Watson",
    email: "ewatson@cloudsync.dev",
    company: "CloudSync Labs",
    phone: "+1 (650) 555-0167",
    stage: "Demo Scheduled",
    lastContact: new Date(Date.now() - 1 * 86400000).toISOString(),
    jobtitle: "Head of Engineering",
  },
  {
    id: "mock-4",
    name: "David Kim",
    email: "d.kim@scaleup.vc",
    company: "ScaleUp Ventures",
    phone: "+1 (310) 555-0134",
    stage: "Qualified Lead",
    lastContact: new Date(Date.now() - 3 * 86400000).toISOString(),
    jobtitle: "Operations Partner",
  },
  {
    id: "mock-5",
    name: "Priya Sharma",
    email: "priya@elevatehr.com",
    company: "Elevate HR Solutions",
    phone: "+1 (408) 555-0156",
    stage: "Proposal Sent",
    lastContact: new Date(Date.now() - 7 * 86400000).toISOString(),
    jobtitle: "Head of Sales",
  },
];

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
