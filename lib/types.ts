// Lead from HubSpot CRM
export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  stage: string;
  lastContact: string;
  jobtitle: string;
}

// Chat message in the conversation
export interface ChatMessage {
  id: string;
  role: "customer" | "salesperson";
  content: string;
  timestamp: string;
  analysis?: {
    interest: number;
    tone: string;
    intent: string;
  };
}

// AI response from Gemini
export interface AIResponse {
  reply: string;
  scores: {
    interest: number;
    tone: string;
    intent: string;
    engagement: number;
    summary: string;
  };
}

// Deal from HubSpot CRM
export interface Deal {
  id: string;
  dealname: string;
  amount: string;
  dealstage: string;
  createdAt: string;
}
