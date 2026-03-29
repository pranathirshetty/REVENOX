import { NextResponse } from "next/server";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";

export async function GET() {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    console.warn("No HUBSPOT_API_KEY found — returning mock leads");
    return NextResponse.json({ leads: mockLeads, source: "mock" });
  }

  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,company,phone,jobtitle,hs_lead_status,notes_last_contacted",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 }, // cache for 60s
      }
    );

    if (!res.ok) {
      console.error("HubSpot API error:", res.status, await res.text());
      return NextResponse.json({ leads: mockLeads, source: "mock", error: `HubSpot returned ${res.status}` });
    }

    const data = await res.json();
    const hubspotContacts = data.results || [];

    if (hubspotContacts.length === 0) {
      return NextResponse.json({ leads: mockLeads, source: "mock", note: "No contacts in HubSpot" });
    }

    const leads: Lead[] = hubspotContacts.map((contact: Record<string, unknown>) => {
      const props = contact.properties as Record<string, string | null> || {};
      const firstName = props.firstname || "";
      const lastName = props.lastname || "";
      const name = `${firstName} ${lastName}`.trim() || "Unknown Contact";

      return {
        id: String(contact.id),
        name,
        email: props.email || "—",
        company: props.company || "—",
        phone: props.phone || "—",
        jobtitle: props.jobtitle || "—",
        stage: props.hs_lead_status || "New Lead",
        lastContact: props.notes_last_contacted || new Date().toISOString(),
      };
    });

    return NextResponse.json({ leads, source: "hubspot" });
  } catch (err) {
    console.error("HubSpot fetch failed:", err);
    return NextResponse.json({ leads: mockLeads, source: "mock", error: "Network error" });
  }
}
