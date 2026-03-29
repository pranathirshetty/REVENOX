import { NextRequest, NextResponse } from "next/server";
import type { Deal } from "@/lib/types";

export async function GET() {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key found", deals: [] }, { status: 401 });
  }

  try {
    // Fetch deals from HubSpot API
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,createdate",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        // disable caching so real deals are always fetched directly
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("HubSpot API error:", res.status, await res.text());
      return NextResponse.json({ error: `HubSpot returned ${res.status}`, deals: [] }, { status: 500 });
    }

    const data = await res.json();
    const hubspotDeals = data.results || [];

    const deals: Deal[] = hubspotDeals.map((deal: Record<string, unknown>) => {
      const props = (deal.properties as Record<string, string | null>) || {};
      return {
        id: String(deal.id),
        dealname: props.dealname || "Unnamed Deal",
        amount: props.amount || "0",
        dealstage: props.dealstage || "3422931680", // Default typical stage
        createdAt: deal.createdAt || props.createdate || new Date().toISOString(),
      };
    });

    return NextResponse.json({ deals, source: "hubspot" });
  } catch (err) {
    console.error("HubSpot fetch failed:", err);
    return NextResponse.json({ error: "Network error", deals: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key found" }, { status: 401 });
  }

  try {
    const { dealname, amount, dealstage } = await req.json();

    if (!dealname) {
      return NextResponse.json({ error: "Deal name is required" }, { status: 400 });
    }

    // HubSpot deal creation payload
    const payload = {
      properties: {
        dealname,
        amount: amount || "0",
        pipeline: "default", // You typically assign "default" unless you have custom pipelines
        dealstage: dealstage || "3422931680", 
      },
    };

    const res = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("HubSpot API Deals POST error:", res.status, errText);
      return NextResponse.json({ error: `HubSpot failed to create deal: ${errText}` }, { status: 500 });
    }

    const createdDealData = await res.json();
    return NextResponse.json({ success: true, deal: createdDealData });
  } catch (err) {
    console.error("HubSpot Deals Post failed:", err);
    return NextResponse.json({ error: "Network error creating deal" }, { status: 500 });
  }
}
