import { NextRequest, NextResponse } from "next/server";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";

function splitName(fullName: string) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstname: "", lastname: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

const HUBSPOT_LEAD_STATUS_OPTIONS = new Set([
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "OPEN_DEAL",
  "UNQUALIFIED",
  "ATTEMPTED_TO_CONTACT",
  "CONNECTED",
  "BAD_TIMING",
]);

function fromHubSpotLeadStatus(status?: string | null) {
  const s = String(status || "").trim().toUpperCase();
  switch (s) {
    case "NEW":
      return "New Lead";
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "OPEN_DEAL":
      return "Open Deal";
    case "UNQUALIFIED":
      return "Unqualified";
    case "ATTEMPTED_TO_CONTACT":
      return "Attempted to Contact";
    case "CONNECTED":
      return "Connected";
    case "BAD_TIMING":
      return "Bad Timing";
    default:
      return status || "";
  }
}

function toHubSpotLeadStatus(stage?: string) {
  const raw = String(stage || "").trim();
  if (!raw) return "NEW";

  const upper = raw.toUpperCase();
  if (HUBSPOT_LEAD_STATUS_OPTIONS.has(upper)) return upper;

  const lower = raw.toLowerCase();

  if (lower.includes("new")) return "NEW";
  if (lower.includes("unqual")) return "UNQUALIFIED";
  if (lower.includes("attempt")) return "ATTEMPTED_TO_CONTACT";
  if (lower.includes("bad timing")) return "BAD_TIMING";
  if (lower.includes("connect") || lower.includes("qualif")) return "CONNECTED";
  if (lower.includes("open deal") || lower.includes("proposal")) return "OPEN_DEAL";
  if (lower.includes("in progress") || lower.includes("demo") || lower.includes("meeting")) {
    return "IN_PROGRESS";
  }
  if (lower.includes("open")) return "OPEN";

  return "NEW";
}

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
        cache: "no-store",
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
        stage: fromHubSpotLeadStatus(props.hs_lead_status) || "New Lead",
        lastContact: props.notes_last_contacted || new Date().toISOString(),
      };
    });

    return NextResponse.json({ leads, source: "hubspot" });
  } catch (err) {
    console.error("HubSpot fetch failed:", err);
    return NextResponse.json({ leads: mockLeads, source: "mock", error: "Network error" });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    jobtitle?: string;
    stage?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const company = String(body.company || "").trim();
  const phone = String(body.phone || "").trim();
  const jobtitle = String(body.jobtitle || "").trim();
  const hsLeadStatus = toHubSpotLeadStatus(body.stage);
  const stage = fromHubSpotLeadStatus(hsLeadStatus) || "New Lead";

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Name, email, and company are required" },
      { status: 400 }
    );
  }

  const { firstname, lastname } = splitName(name);

  const apiKey = process.env.HUBSPOT_API_KEY;
  const nowIso = new Date().toISOString();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "HUBSPOT_API_KEY is not configured. Add it to a root .env.local file and restart the dev server.",
      },
      { status: 401 }
    );
  }

  try {
    const payload = {
      properties: {
        firstname,
        lastname,
        email,
        company,
        ...(phone ? { phone } : {}),
        ...(jobtitle ? { jobtitle } : {}),
        hs_lead_status: hsLeadStatus,
      },
    };

    const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("HubSpot leads POST error:", res.status, text);
      return NextResponse.json(
        { error: `HubSpot failed to create lead: ${text}` },
        { status: res.status }
      );
    }

    const created = (await res.json()) as {
      id: string;
      properties?: Record<string, string | null>;
      createdAt?: string;
    };

    const props = created.properties || {};
    const returnedStatus = props.hs_lead_status || hsLeadStatus;
    const createdLead: Lead = {
      id: String(created.id),
      name: `${props.firstname || firstname} ${props.lastname || lastname}`.trim() || name,
      email: props.email || email,
      company: props.company || company,
      phone: props.phone || phone || "—",
      jobtitle: props.jobtitle || jobtitle || "—",
      stage: fromHubSpotLeadStatus(returnedStatus) || stage,
      lastContact: props.notes_last_contacted || created.createdAt || nowIso,
    };

    return NextResponse.json({ success: true, lead: createdLead, source: "hubspot" });
  } catch (err) {
    console.error("HubSpot create lead failed:", err);
    return NextResponse.json(
      { error: "Network error creating lead" },
      { status: 500 }
    );
  }
}
