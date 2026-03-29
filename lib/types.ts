// ============================================================
// REVENOX — Core Type Definitions
// Structured to match future backend API response shapes
// ============================================================

export type DealStage =
  | "new_lead"
  | "qualified"
  | "demo_scheduled"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type SentimentTone =
  | "positive"
  | "neutral"
  | "negative"
  | "curious"
  | "hesitant"
  | "excited";

export type IntentType =
  | "purchase"
  | "information"
  | "comparison"
  | "objection"
  | "follow_up"
  | "unsubscribe";

export type InterestLevel = "hot" | "warm" | "cold";

export type ActionType =
  | "send_demo"
  | "send_info"
  | "follow_up"
  | "send_proposal"
  | "schedule_call"
  | "stop_outreach"
  | "escalate";

export type ActivityAction =
  | "ai_suggestion"
  | "message_sent"
  | "message_received"
  | "deal_moved"
  | "ai_analysis"
  | "human_override"
  | "deal_created"
  | "note_added";

export type HumanDecision = "accepted" | "modified" | "rejected" | "pending";

// ============================================================
// Core Entities
// ============================================================

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string; // e.g. "50-200"
  revenue: string; // e.g. "$5M-$10M"
  website: string;
  techStack: string[];
  logo?: string;
}

export interface Deal {
  id: string;
  title: string;
  company: Company;
  contact: Contact;
  value: number;
  stage: DealStage;
  probability: number; // 0-100
  aiConfidence: number; // 0-100
  daysInStage: number;
  createdAt: string;
  updatedAt: string;
  expectedCloseDate: string;
  notes: string;
  interestLevel: InterestLevel;
}

export interface Message {
  id: string;
  dealId: string;
  sender: "human" | "customer";
  content: string;
  timestamp: string;
  aiAnalysis?: AIMessageAnalysis;
}

export interface AIMessageAnalysis {
  tone: SentimentTone;
  intent: IntentType;
  interestLevel: InterestLevel;
  confidence: number;
  summary: string;
}

export interface AISuggestion {
  id: string;
  dealId: string;
  suggestedReply: string;
  suggestedAction: ActionType;
  reasoning: string;
  confidence: number;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: ActivityAction;
  dealId: string;
  dealTitle: string;
  description: string;
  aiSuggestion?: string;
  humanDecision?: HumanDecision;
  outcome?: string;
  actor: "ai" | "human";
}

export interface Prospect {
  id: string;
  company: Company;
  contacts: Contact[];
  aiResearchSummary: string;
  fitScore: number; // 0-100
  status: "new" | "researching" | "qualified" | "disqualified";
  lastUpdated: string;
  signals: string[];
}

// ============================================================
// Dashboard Stats
// ============================================================

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeDeals: number;
  dealsChange: number;
  conversionRate: number;
  conversionChange: number;
  avgDealSize: number;
  avgDealSizeChange: number;
  meetingsBooked: number;
  meetingsChange: number;
  responseRate: number;
  responseRateChange: number;
}

export interface PipelineStageCount {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
}
