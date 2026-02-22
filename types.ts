// ============================================================
// LeadPulse by HSR Motors — Type Definitions
// ============================================================

export type LeadSource = 'Facebook' | 'Google' | 'Twitter' | 'Website' | 'Offline';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Not Interested' | 'Closed Won' | 'Closed Lost';

export type CarInterest = 'SUV' | 'Sedan' | 'Hatchback' | 'EV' | 'Luxury' | 'MUV';

export type CallOutcome = 'Answered' | 'No Response' | 'Call Back Later';

export type UserRole = 'Sales Executive' | 'Business Manager';

export type ActivityType = 'created' | 'status_change' | 'call_logged' | 'note_added' | 'assigned' | 'callback_scheduled';

export interface SalesExecutive {
  id: string;
  name: string;
  avatar: string; // initials
  email: string;
  phone: string;
  leadsAssigned: number;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string; // ISO
  userId: string;
  userName: string;
}

export interface CallLog {
  id: string;
  note: string;
  outcome: CallOutcome;
  timestamp: string;
  userId: string;
  userName: string;
  aiSummary?: string;
  aiNextAction?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  carInterest: CarInterest;
  carModel: string; // e.g. "Toyota Fortuner"
  budget: string; // e.g. "₹15L - ₹25L"
  testDriveDate?: string; // ISO date
  status: LeadStatus;
  assignedTo: string; // SalesExecutive id
  assignedToName: string;
  createdAt: string; // ISO
  lastActivity: string; // ISO
  campaignName?: string; // e.g. "Diwali Offer"
  activities: ActivityLog[];
  callLogs: CallLog[];
  notes: string[];
  isStale: boolean; // New + older than 2 hours
}

export interface DashboardStats {
  totalLeads: number;
  totalLeadsLastMonth: number;
  qualifiedLeads: number;
  qualifiedLeadsLastMonth: number;
  avgResponseTimeHrs: number;
  closedWon: number;
  closedWonLastMonth: number;
  leadsBySource: { source: LeadSource; count: number; color: string }[];
  leadStatusFunnel: { status: string; count: number; color: string }[];
  leadsByDay: { date: string; total: number; Facebook: number; Google: number; Twitter: number; Website: number; Offline: number }[];
  teamPerformance: TeamPerformance[];
  recentActivity: ActivityLog[];
}

export interface TeamPerformance {
  executive: SalesExecutive;
  leadsAssigned: number;
  contacted: number;
  qualified: number;
  closedWon: number;
  avgResponseTimeHrs: number;
}

export interface LeadSource_Config {
  id: string;
  name: LeadSource;
  icon: string;
  color: string;
  enabled: boolean;
  lastSync: string;
  leadCount: number;
}

export interface AssignmentRule {
  id: string;
  source?: LeadSource;
  carInterest?: CarInterest;
  assignToTeam: string;
  roundRobin: boolean;
}

export interface SLAConfig {
  responseHours: number;
  alertRecipients: string[];
  escalateAfterHours: number;
  escalateTo: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface NLQueryResult {
  question: string;
  answer: string;
  loading: boolean;
}
