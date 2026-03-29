// ============================================================
// REVENOX — Mock Data
// Realistic sample data for all frontend pages
// ============================================================

import type {
  Deal,
  Message,
  AISuggestion,
  ActivityLogEntry,
  Prospect,
  DashboardStats,
  PipelineStageCount,
} from "./types";

// ============================================================
// Dashboard Stats
// ============================================================

export const dashboardStats: DashboardStats = {
  totalRevenue: 284500,
  revenueChange: 12.5,
  activeDeals: 47,
  dealsChange: 8.3,
  conversionRate: 34.2,
  conversionChange: -2.1,
  avgDealSize: 18700,
  avgDealSizeChange: 5.7,
  meetingsBooked: 23,
  meetingsChange: 15.4,
  responseRate: 68,
  responseRateChange: 3.2,
};

export const pipelineStageCounts: PipelineStageCount[] = [
  { stage: "new_lead", label: "New Lead", count: 12, value: 156000 },
  { stage: "qualified", label: "Qualified", count: 8, value: 198000 },
  { stage: "demo_scheduled", label: "Demo", count: 6, value: 142000 },
  { stage: "proposal", label: "Proposal", count: 5, value: 235000 },
  { stage: "negotiation", label: "Negotiation", count: 4, value: 184000 },
  { stage: "closed_won", label: "Won", count: 9, value: 284500 },
  { stage: "closed_lost", label: "Lost", count: 3, value: 67000 },
];

// ============================================================
// Deals
// ============================================================

export const deals: Deal[] = [
  {
    id: "deal-001",
    title: "Enterprise CRM Migration",
    company: {
      id: "comp-001",
      name: "TechVault Inc.",
      industry: "Technology",
      size: "200-500",
      revenue: "$20M-$50M",
      website: "techvault.io",
      techStack: ["Salesforce", "HubSpot", "Slack", "AWS"],
    },
    contact: {
      id: "contact-001",
      name: "Sarah Chen",
      email: "sarah.chen@techvault.io",
      phone: "+1 (415) 555-0142",
      role: "VP of Sales",
    },
    value: 48000,
    stage: "proposal",
    probability: 72,
    aiConfidence: 78,
    daysInStage: 5,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-28T14:30:00Z",
    expectedCloseDate: "2026-04-15T00:00:00Z",
    notes: "High priority — looking for Q2 deployment",
    interestLevel: "hot",
  },
  {
    id: "deal-002",
    title: "Marketing Suite Upgrade",
    company: {
      id: "comp-002",
      name: "BrightPath Media",
      industry: "Marketing",
      size: "50-200",
      revenue: "$5M-$10M",
      website: "brightpath.co",
      techStack: ["Mailchimp", "Google Ads", "WordPress"],
    },
    contact: {
      id: "contact-002",
      name: "James Rodriguez",
      email: "j.rodriguez@brightpath.co",
      phone: "+1 (310) 555-0198",
      role: "Marketing Director",
    },
    value: 24500,
    stage: "demo_scheduled",
    probability: 55,
    aiConfidence: 62,
    daysInStage: 3,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-27T11:00:00Z",
    expectedCloseDate: "2026-04-30T00:00:00Z",
    notes: "Demo scheduled for next Tuesday. Interested in analytics features.",
    interestLevel: "warm",
  },
  {
    id: "deal-003",
    title: "Data Analytics Platform",
    company: {
      id: "comp-003",
      name: "Nexus Financial",
      industry: "Finance",
      size: "500-1000",
      revenue: "$50M-$100M",
      website: "nexusfinancial.com",
      techStack: ["Bloomberg Terminal", "Python", "Tableau", "Azure"],
    },
    contact: {
      id: "contact-003",
      name: "Michael Park",
      email: "m.park@nexusfinancial.com",
      phone: "+1 (212) 555-0267",
      role: "CTO",
    },
    value: 95000,
    stage: "negotiation",
    probability: 82,
    aiConfidence: 85,
    daysInStage: 7,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-03-28T16:00:00Z",
    expectedCloseDate: "2026-04-10T00:00:00Z",
    notes: "Finalizing contract terms. Legal review in progress.",
    interestLevel: "hot",
  },
  {
    id: "deal-004",
    title: "Team Collaboration Tool",
    company: {
      id: "comp-004",
      name: "CloudSync Labs",
      industry: "Technology",
      size: "100-200",
      revenue: "$10M-$20M",
      website: "cloudsync.dev",
      techStack: ["Jira", "Confluence", "GitHub", "GCP"],
    },
    contact: {
      id: "contact-004",
      name: "Emily Watson",
      email: "emily.w@cloudsync.dev",
      phone: "+1 (650) 555-0312",
      role: "Head of Engineering",
    },
    value: 32000,
    stage: "qualified",
    probability: 40,
    aiConfidence: 45,
    daysInStage: 10,
    createdAt: "2026-03-05T13:00:00Z",
    updatedAt: "2026-03-26T09:00:00Z",
    expectedCloseDate: "2026-05-15T00:00:00Z",
    notes: "Evaluating multiple vendors. Price-sensitive.",
    interestLevel: "warm",
  },
  {
    id: "deal-005",
    title: "Security Compliance Package",
    company: {
      id: "comp-005",
      name: "MediCore Health",
      industry: "Healthcare",
      size: "1000-5000",
      revenue: "$100M+",
      website: "medicore.health",
      techStack: ["Epic Systems", "Azure", "ServiceNow"],
    },
    contact: {
      id: "contact-005",
      name: "Dr. Aisha Patel",
      email: "a.patel@medicore.health",
      phone: "+1 (617) 555-0489",
      role: "CISO",
    },
    value: 125000,
    stage: "new_lead",
    probability: 20,
    aiConfidence: 35,
    daysInStage: 2,
    createdAt: "2026-03-27T11:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
    expectedCloseDate: "2026-06-30T00:00:00Z",
    notes: "Inbound lead from webinar. HIPAA compliance is key requirement.",
    interestLevel: "warm",
  },
  {
    id: "deal-006",
    title: "E-Commerce Integration",
    company: {
      id: "comp-006",
      name: "UrbanStyle Co.",
      industry: "Retail",
      size: "50-100",
      revenue: "$2M-$5M",
      website: "urbanstyle.shop",
      techStack: ["Shopify", "Stripe", "Klaviyo"],
    },
    contact: {
      id: "contact-006",
      name: "Lisa Chang",
      email: "lisa@urbanstyle.shop",
      phone: "+1 (323) 555-0567",
      role: "CEO",
    },
    value: 15000,
    stage: "new_lead",
    probability: 25,
    aiConfidence: 30,
    daysInStage: 1,
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T09:00:00Z",
    expectedCloseDate: "2026-05-30T00:00:00Z",
    notes: "Cold outreach — showed interest in AI chatbot for customer support.",
    interestLevel: "cold",
  },
  {
    id: "deal-007",
    title: "HR Automation Platform",
    company: {
      id: "comp-007",
      name: "ScaleUp Ventures",
      industry: "Venture Capital",
      size: "20-50",
      revenue: "$50M+ AUM",
      website: "scaleupvc.com",
      techStack: ["Notion", "Airtable", "Zoom"],
    },
    contact: {
      id: "contact-007",
      name: "David Kim",
      email: "david@scaleupvc.com",
      phone: "+1 (408) 555-0634",
      role: "Operations Partner",
    },
    value: 18000,
    stage: "qualified",
    probability: 50,
    aiConfidence: 55,
    daysInStage: 6,
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-03-27T15:00:00Z",
    expectedCloseDate: "2026-05-01T00:00:00Z",
    notes: "Needs solution for portfolio company talent management.",
    interestLevel: "warm",
  },
  {
    id: "deal-008",
    title: "Supply Chain Dashboard",
    company: {
      id: "comp-008",
      name: "GreenLeaf Logistics",
      industry: "Logistics",
      size: "200-500",
      revenue: "$20M-$50M",
      website: "greenleaf.logistics",
      techStack: ["SAP", "Oracle", "Tableau"],
    },
    contact: {
      id: "contact-008",
      name: "Robert Foster",
      email: "r.foster@greenleaf.logistics",
      phone: "+1 (503) 555-0721",
      role: "VP of Operations",
    },
    value: 67000,
    stage: "demo_scheduled",
    probability: 60,
    aiConfidence: 58,
    daysInStage: 4,
    createdAt: "2026-02-28T10:00:00Z",
    updatedAt: "2026-03-28T12:00:00Z",
    expectedCloseDate: "2026-04-25T00:00:00Z",
    notes: "Very interested in real-time tracking. Decision maker confirmed.",
    interestLevel: "hot",
  },
  {
    id: "deal-009",
    title: "Customer Support AI",
    company: {
      id: "comp-009",
      name: "Pinnacle SaaS",
      industry: "Technology",
      size: "100-200",
      revenue: "$10M-$20M",
      website: "pinnaclesaas.com",
      techStack: ["Zendesk", "Intercom", "AWS"],
    },
    contact: {
      id: "contact-009",
      name: "Nina Kowalski",
      email: "nina@pinnaclesaas.com",
      phone: "+1 (718) 555-0845",
      role: "Head of Support",
    },
    value: 38000,
    stage: "closed_won",
    probability: 100,
    aiConfidence: 92,
    daysInStage: 0,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-03-20T16:00:00Z",
    expectedCloseDate: "2026-03-20T00:00:00Z",
    notes: "Closed! 3-year contract signed. Onboarding starts April 1.",
    interestLevel: "hot",
  },
  {
    id: "deal-010",
    title: "Inventory Management System",
    company: {
      id: "comp-010",
      name: "Harbor Foods",
      industry: "Food & Beverage",
      size: "500-1000",
      revenue: "$50M-$100M",
      website: "harborfoods.com",
      techStack: ["NetSuite", "Shopify Plus", "Slack"],
    },
    contact: {
      id: "contact-010",
      name: "Carlos Mendez",
      email: "carlos@harborfoods.com",
      phone: "+1 (786) 555-0923",
      role: "Director of IT",
    },
    value: 54000,
    stage: "closed_won",
    probability: 100,
    aiConfidence: 88,
    daysInStage: 0,
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-03-15T14:00:00Z",
    expectedCloseDate: "2026-03-15T00:00:00Z",
    notes: "Closed! Integration with NetSuite was the winning factor.",
    interestLevel: "hot",
  },
  {
    id: "deal-011",
    title: "DevOps Pipeline Tool",
    company: {
      id: "comp-011",
      name: "CodeForge",
      industry: "Technology",
      size: "50-100",
      revenue: "$5M-$10M",
      website: "codeforge.io",
      techStack: ["GitLab", "Docker", "Kubernetes", "Terraform"],
    },
    contact: {
      id: "contact-011",
      name: "Alex Turner",
      email: "alex@codeforge.io",
      phone: "+1 (512) 555-0156",
      role: "CTO",
    },
    value: 22000,
    stage: "closed_lost",
    probability: 0,
    aiConfidence: 15,
    daysInStage: 0,
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-03-22T11:00:00Z",
    expectedCloseDate: "2026-03-20T00:00:00Z",
    notes: "Lost to competitor — chose GitLab's native CI/CD tools.",
    interestLevel: "cold",
  },
  {
    id: "deal-012",
    title: "Onboarding Automation",
    company: {
      id: "comp-012",
      name: "Elevate HR",
      industry: "Human Resources",
      size: "100-200",
      revenue: "$10M-$20M",
      website: "elevatehr.com",
      techStack: ["Workday", "BambooHR", "Slack"],
    },
    contact: {
      id: "contact-012",
      name: "Priya Sharma",
      email: "priya@elevatehr.com",
      phone: "+1 (206) 555-0278",
      role: "Head of People Ops",
    },
    value: 29000,
    stage: "proposal",
    probability: 65,
    aiConfidence: 70,
    daysInStage: 8,
    createdAt: "2026-02-20T13:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
    expectedCloseDate: "2026-04-20T00:00:00Z",
    notes: "Proposal sent. Waiting on budget approval from CFO.",
    interestLevel: "warm",
  },
];

// ============================================================
// Conversations (for Deal Detail page)
// ============================================================

export const conversations: Record<string, Message[]> = {
  "deal-001": [
    {
      id: "msg-001",
      dealId: "deal-001",
      sender: "human",
      content:
        "Hi Sarah, I wanted to follow up on our discussion about migrating your CRM to our platform. I've put together a customized migration plan that addresses the data integrity concerns you raised.",
      timestamp: "2026-03-25T10:00:00Z",
    },
    {
      id: "msg-002",
      dealId: "deal-001",
      sender: "customer",
      content:
        "Thanks for sending that over! I reviewed the migration plan with our IT team. We're generally happy with the approach, but we have some concerns about downtime during the transition. Our Q2 is critical and we can't afford any disruptions. Could you walk us through the zero-downtime migration strategy?",
      timestamp: "2026-03-25T14:30:00Z",
      aiAnalysis: {
        tone: "curious",
        intent: "information",
        interestLevel: "hot",
        confidence: 87,
        summary:
          "Prospect is engaged and has involved their IT team. The concern about downtime is a practical objection, not a deal-breaker. High buying signals — asking about implementation details suggests they're planning for execution.",
      },
    },
    {
      id: "msg-003",
      dealId: "deal-001",
      sender: "human",
      content:
        "Absolutely, Sarah! Great question. Our migration process uses a parallel-run approach: we set up the new system alongside your existing one, sync data in real-time for 2 weeks, then do a seamless cutover during off-hours. Zero downtime, zero data loss. I can set up a technical deep-dive with your IT team this week if that works?",
      timestamp: "2026-03-26T09:00:00Z",
    },
    {
      id: "msg-004",
      dealId: "deal-001",
      sender: "customer",
      content:
        "That sounds much more reassuring. Yes, let's schedule that technical deep-dive. Can you also include pricing for the enterprise tier? We'd need at least 150 seats. And I'd like to understand the training timeline — we need our team fully onboarded before Q2 targets kick in.",
      timestamp: "2026-03-26T15:00:00Z",
      aiAnalysis: {
        tone: "excited",
        intent: "purchase",
        interestLevel: "hot",
        confidence: 92,
        summary:
          "Very strong buying signal. Prospect is asking about pricing and seat count — indicating budget planning. Training timeline question shows they're already thinking post-purchase. This deal is likely to close within 2-3 weeks.",
      },
    },
    {
      id: "msg-005",
      dealId: "deal-001",
      sender: "human",
      content:
        "Wonderful! I'll send over the enterprise pricing for 150 seats along with our standard training program (2-week intensive + ongoing support). For the deep-dive, how does Thursday at 2 PM work for your IT team?",
      timestamp: "2026-03-27T10:00:00Z",
    },
    {
      id: "msg-006",
      dealId: "deal-001",
      sender: "customer",
      content:
        "Thursday at 2 PM works perfectly. Please send a calendar invite to me, Tom (our IT Director) at tom.h@techvault.io, and our CFO Rachel at rachel.s@techvault.io. If the pricing and technical review go well, we'd like to move forward by mid-April.",
      timestamp: "2026-03-27T16:00:00Z",
      aiAnalysis: {
        tone: "positive",
        intent: "purchase",
        interestLevel: "hot",
        confidence: 95,
        summary:
          "Deal is in the final stages. Prospect is involving CFO (budget authority) and IT Director (technical authority). Explicit mention of moving forward by mid-April. Probability of close: very high.",
      },
    },
  ],
  "deal-003": [
    {
      id: "msg-101",
      dealId: "deal-003",
      sender: "human",
      content:
        "Michael, following up on the contract draft we sent last week. Our legal team has addressed all the data residency requirements you mentioned. Happy to walk through the changes.",
      timestamp: "2026-03-26T09:00:00Z",
    },
    {
      id: "msg-102",
      dealId: "deal-003",
      sender: "customer",
      content:
        "Thanks. Our legal is reviewing now. One thing — we need the data processing addendum to explicitly mention EU data residency for our London office. Also, can we negotiate on the payment terms? Net-60 would work better for our procurement cycle.",
      timestamp: "2026-03-27T11:00:00Z",
      aiAnalysis: {
        tone: "neutral",
        intent: "purchase",
        interestLevel: "hot",
        confidence: 88,
        summary:
          "Negotiation phase details. Prospect is working through legal and procurement — these are finalization signals. The net-60 ask is standard enterprise procurement. EU data residency is a compliance checkbox, not a deal-breaker.",
      },
    },
  ],
};

// ============================================================
// AI Suggestions
// ============================================================

export const aiSuggestions: Record<string, AISuggestion> = {
  "deal-001": {
    id: "sug-001",
    dealId: "deal-001",
    suggestedReply:
      "Hi Sarah, calendar invite sent to you, Tom, and Rachel for Thursday at 2 PM. I've attached the Enterprise pricing breakdown for 150 seats ($48,000/year) along with our training program overview.\n\nKey highlights for the call:\n• Zero-downtime parallel migration (2-week parallel run)\n• Dedicated migration engineer assigned\n• 2-week intensive training + 90 days of priority support\n\nLooking forward to Thursday! Let me know if you need anything before then.",
    suggestedAction: "schedule_call",
    reasoning:
      "Sarah has confirmed the meeting and involved key decision-makers (CFO + IT Director). The next step should focus on sending the calendar invite immediately and providing pricing transparency before the call. The deal is in a strong position — maintain momentum by being proactive.",
    confidence: 94,
    createdAt: "2026-03-28T08:00:00Z",
  },
  "deal-003": {
    id: "sug-003",
    dealId: "deal-003",
    suggestedReply:
      "Michael, absolutely — I'll have our legal team add the explicit EU data residency clause for your London operations by end of day. Regarding payment terms, we can accommodate Net-60 for annual contracts at the enterprise tier. I'll send the updated contract draft with both changes tomorrow morning.",
    suggestedAction: "send_proposal",
    reasoning:
      "The prospect's requests (EU residency clause and Net-60 terms) are both standard accommodations that won't impact margins. Agreeing quickly demonstrates flexibility and keeps the deal momentum. Next step: get the updated contract signed.",
    confidence: 90,
    createdAt: "2026-03-28T10:00:00Z",
  },
};

// ============================================================
// Activity Log
// ============================================================

export const activityLog: ActivityLogEntry[] = [
  {
    id: "act-001",
    timestamp: "2026-03-28T16:00:00Z",
    action: "ai_analysis",
    dealId: "deal-001",
    dealTitle: "Enterprise CRM Migration",
    description:
      "AI analyzed Sarah Chen's latest response — detected purchase intent with 95% confidence",
    aiSuggestion: "Schedule technical deep-dive and send enterprise pricing",
    humanDecision: "accepted",
    outcome: "Meeting scheduled for Thursday",
    actor: "ai",
  },
  {
    id: "act-002",
    timestamp: "2026-03-28T15:30:00Z",
    action: "message_sent",
    dealId: "deal-001",
    dealTitle: "Enterprise CRM Migration",
    description:
      "Sent follow-up message confirming Thursday meeting with IT team",
    actor: "human",
  },
  {
    id: "act-003",
    timestamp: "2026-03-28T14:00:00Z",
    action: "ai_suggestion",
    dealId: "deal-003",
    dealTitle: "Data Analytics Platform",
    description:
      "AI suggested accommodating Net-60 payment terms for Nexus Financial",
    aiSuggestion:
      "Accept Net-60 terms — standard for enterprise, maintains deal momentum",
    humanDecision: "modified",
    outcome: "Offered Net-45 as compromise",
    actor: "ai",
  },
  {
    id: "act-004",
    timestamp: "2026-03-28T12:00:00Z",
    action: "deal_moved",
    dealId: "deal-008",
    dealTitle: "Supply Chain Dashboard",
    description:
      "GreenLeaf Logistics moved from Qualified to Demo Scheduled",
    actor: "human",
  },
  {
    id: "act-005",
    timestamp: "2026-03-28T11:00:00Z",
    action: "message_received",
    dealId: "deal-004",
    dealTitle: "Team Collaboration Tool",
    description:
      "Received response from Emily Watson at CloudSync Labs — requesting feature comparison",
    actor: "human",
  },
  {
    id: "act-006",
    timestamp: "2026-03-28T10:30:00Z",
    action: "ai_suggestion",
    dealId: "deal-005",
    dealTitle: "Security Compliance Package",
    description:
      "AI generated personalized outreach for MediCore Health based on HIPAA compliance needs",
    aiSuggestion:
      "Lead with HIPAA compliance certifications and case study from similar healthcare client",
    humanDecision: "accepted",
    outcome: "Outreach sent",
    actor: "ai",
  },
  {
    id: "act-007",
    timestamp: "2026-03-28T09:00:00Z",
    action: "deal_created",
    dealId: "deal-006",
    dealTitle: "E-Commerce Integration",
    description:
      "New deal created — UrbanStyle Co. showed interest via cold outreach",
    actor: "human",
  },
  {
    id: "act-008",
    timestamp: "2026-03-27T17:00:00Z",
    action: "ai_analysis",
    dealId: "deal-002",
    dealTitle: "Marketing Suite Upgrade",
    description:
      "AI detected hesitant tone in James Rodriguez's last message — recommended addressing pricing concerns",
    aiSuggestion:
      "Offer a limited pilot program at reduced cost to lower perceived risk",
    humanDecision: "rejected",
    outcome: "Sent standard demo invitation instead",
    actor: "ai",
  },
  {
    id: "act-009",
    timestamp: "2026-03-27T15:00:00Z",
    action: "human_override",
    dealId: "deal-007",
    dealTitle: "HR Automation Platform",
    description:
      "Overrode AI suggestion to stop outreach — continued with modified approach",
    aiSuggestion:
      "Pause outreach for 2 weeks — prospect seems disengaged",
    humanDecision: "rejected",
    outcome: "Sent personalized case study — got positive response",
    actor: "human",
  },
  {
    id: "act-010",
    timestamp: "2026-03-27T14:00:00Z",
    action: "note_added",
    dealId: "deal-012",
    dealTitle: "Onboarding Automation",
    description:
      "Added note: CFO budget review expected next week for Elevate HR",
    actor: "human",
  },
  {
    id: "act-011",
    timestamp: "2026-03-27T11:00:00Z",
    action: "ai_suggestion",
    dealId: "deal-004",
    dealTitle: "Team Collaboration Tool",
    description:
      "AI recommended sending a competitive analysis highlighting advantages over Jira",
    aiSuggestion:
      "Send feature comparison sheet focused on integration capabilities and pricing advantage",
    humanDecision: "accepted",
    outcome: "Comparison sheet sent — awaiting response",
    actor: "ai",
  },
  {
    id: "act-012",
    timestamp: "2026-03-27T09:00:00Z",
    action: "message_sent",
    dealId: "deal-012",
    dealTitle: "Onboarding Automation",
    description:
      "Sent updated proposal to Priya Sharma at Elevate HR with revised pricing",
    actor: "human",
  },
];

// ============================================================
// Prospects
// ============================================================

export const prospects: Prospect[] = [
  {
    id: "prospect-001",
    company: {
      id: "comp-013",
      name: "Quantum Dynamics",
      industry: "Aerospace",
      size: "1000-5000",
      revenue: "$200M+",
      website: "quantumdynamics.aero",
      techStack: ["MATLAB", "Siemens NX", "Azure", "SAP"],
    },
    contacts: [
      {
        id: "contact-013",
        name: "Dr. Rebecca Stone",
        email: "r.stone@quantumdynamics.aero",
        phone: "+1 (303) 555-1234",
        role: "VP of Digital Transformation",
      },
      {
        id: "contact-014",
        name: "Mark Liu",
        email: "m.liu@quantumdynamics.aero",
        phone: "+1 (303) 555-1235",
        role: "Senior IT Manager",
      },
    ],
    aiResearchSummary:
      "Quantum Dynamics is a mid-size aerospace manufacturer undergoing digital transformation. Recently posted job listings for 'Digital Twin Engineer' and 'Cloud Infrastructure Lead' — indicating significant tech investment. Their current SAP implementation is 8+ years old, suggesting upgrade cycle. Q3 earnings call mentioned 'operational efficiency initiatives' as a top priority. High fit for our analytics platform.",
    fitScore: 82,
    status: "researching",
    lastUpdated: "2026-03-28T15:00:00Z",
    signals: [
      "Job postings for tech roles",
      "Aging tech stack",
      "Mentioned efficiency goals in earnings",
      "Competitor contract expiring Q3",
    ],
  },
  {
    id: "prospect-002",
    company: {
      id: "comp-014",
      name: "Verdant Energy",
      industry: "Clean Energy",
      size: "200-500",
      revenue: "$30M-$50M",
      website: "verdantenergy.com",
      techStack: ["Salesforce", "AWS", "Power BI"],
    },
    contacts: [
      {
        id: "contact-015",
        name: "Jordan Blake",
        email: "j.blake@verdantenergy.com",
        phone: "+1 (512) 555-2345",
        role: "COO",
      },
    ],
    aiResearchSummary:
      "Verdant Energy is a fast-growing clean energy startup that recently closed Series C funding ($45M). Currently scaling operations across 3 new states. Their Salesforce instance is basic — they need more sophisticated pipeline management. Founder mentioned 'sales efficiency' challenges in a recent podcast interview. Perfect timing for outreach.",
    fitScore: 91,
    status: "qualified",
    lastUpdated: "2026-03-28T12:00:00Z",
    signals: [
      "Series C funding closed",
      "Rapid geographic expansion",
      "Founder mentioned sales challenges",
      "Basic CRM configuration",
    ],
  },
  {
    id: "prospect-003",
    company: {
      id: "comp-015",
      name: "Atlas Retail Group",
      industry: "Retail",
      size: "500-1000",
      revenue: "$75M-$100M",
      website: "atlasretail.com",
      techStack: ["Shopify Plus", "NetSuite", "Looker", "GCP"],
    },
    contacts: [
      {
        id: "contact-016",
        name: "Amanda Torres",
        email: "a.torres@atlasretail.com",
        phone: "+1 (214) 555-3456",
        role: "SVP of E-Commerce",
      },
      {
        id: "contact-017",
        name: "Brian Nakamura",
        email: "b.nakamura@atlasretail.com",
        phone: "+1 (214) 555-3457",
        role: "Head of Data",
      },
    ],
    aiResearchSummary:
      "Atlas Retail operates 40+ brick-and-mortar stores plus a major e-commerce operation. They recently acquired a DTC brand, suggesting integration challenges. Their Looker implementation is mature but they may need better real-time analytics for unified commerce. Moderate fit — need to confirm pain points before outreach.",
    fitScore: 68,
    status: "new",
    lastUpdated: "2026-03-27T09:00:00Z",
    signals: [
      "Recent acquisition",
      "Multi-channel retail complexity",
      "Mature data stack",
      "Potential integration needs",
    ],
  },
  {
    id: "prospect-004",
    company: {
      id: "comp-016",
      name: "Meridian Insurance",
      industry: "Insurance",
      size: "2000-5000",
      revenue: "$500M+",
      website: "meridianinsurance.com",
      techStack: ["Guidewire", "Salesforce", "AWS", "Snowflake"],
    },
    contacts: [
      {
        id: "contact-018",
        name: "Thomas Wright",
        email: "t.wright@meridianinsurance.com",
        phone: "+1 (617) 555-4567",
        role: "Chief Digital Officer",
      },
    ],
    aiResearchSummary:
      "Meridian Insurance is a large traditional insurer investing heavily in digital transformation. Their CDO (Thomas Wright) was recently hired from a tech company — indicating a shift toward modern tooling. They posted an RFI for 'AI-powered claims processing' last month. Long sales cycle expected (6-9 months) but very high deal value potential.",
    fitScore: 75,
    status: "new",
    lastUpdated: "2026-03-26T14:00:00Z",
    signals: [
      "New CDO from tech background",
      "Active RFI for AI solutions",
      "Digital transformation budget approved",
      "Long sales cycle — high value",
    ],
  },
];

// ============================================================
// Helper Functions
// ============================================================

export function getDealsByStage(stage: string): Deal[] {
  return deals.filter((d) => d.stage === stage);
}

export function getDealById(id: string): Deal | undefined {
  return deals.find((d) => d.id === id);
}

export function getConversation(dealId: string): Message[] {
  return conversations[dealId] || [];
}

export function getAISuggestion(dealId: string): AISuggestion | undefined {
  return aiSuggestions[dealId];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    new_lead: "New Lead",
    qualified: "Qualified",
    demo_scheduled: "Demo Scheduled",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };
  return labels[stage] || stage;
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    new_lead: "bg-blue-lighter text-blue-primary",
    qualified: "bg-blue-light text-navy-dark",
    demo_scheduled: "bg-amber-50 text-amber-700",
    proposal: "bg-purple-50 text-purple-700",
    negotiation: "bg-orange-50 text-orange-700",
    closed_won: "bg-emerald-50 text-emerald-700",
    closed_lost: "bg-red-50 text-red-700",
  };
  return colors[stage] || "bg-gray-100 text-gray-700";
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
