import {
    Lead, LeadSource, LeadStatus, CarInterest, SalesExecutive,
    ActivityLog, CallLog, DashboardStats, TeamPerformance,
    LeadSource_Config, AssignmentRule, SLAConfig, PipelineStage,
} from "../types";
import { supabase } from "./supabase";

// ============================================================
// Sales Team
// ============================================================
export const SALES_EXECUTIVES: SalesExecutive[] = [
    { id: "se1", name: "Rohan Sharma", avatar: "RS", email: "rohan@hsrmotors.com", phone: "+91-98001-11111", leadsAssigned: 0 },
    { id: "se2", name: "Priya Nair", avatar: "PN", email: "priya@hsrmotors.com", phone: "+91-98001-22222", leadsAssigned: 0 },
    { id: "se3", name: "Amit Patel", avatar: "AP", email: "amit@hsrmotors.com", phone: "+91-98001-33333", leadsAssigned: 0 },
    { id: "se4", name: "Sneha Reddy", avatar: "SR", email: "sneha@hsrmotors.com", phone: "+91-98001-44444", leadsAssigned: 0 },
    { id: "se5", name: "Vikram Singh", avatar: "VS", email: "vikram@hsrmotors.com", phone: "+91-98001-55555", leadsAssigned: 0 },
];

// ============================================================
// Static config
// ============================================================
export const SOURCE_CONFIG: LeadSource_Config[] = [
    { id: "src1", name: "Facebook", icon: "FB", color: "#1877F2", enabled: true, lastSync: new Date(Date.now() - 3 * 60000).toISOString(), leadCount: 28 },
    { id: "src2", name: "Google", icon: "GO", color: "#EA4335", enabled: true, lastSync: new Date(Date.now() - 8 * 60000).toISOString(), leadCount: 21 },
    { id: "src3", name: "Twitter", icon: "TW", color: "#1DA1F2", enabled: true, lastSync: new Date(Date.now() - 15 * 60000).toISOString(), leadCount: 9 },
    { id: "src4", name: "Website", icon: "WB", color: "#6366F1", enabled: true, lastSync: new Date(Date.now() - 2 * 60000).toISOString(), leadCount: 14 },
    { id: "src5", name: "Offline", icon: "OF", color: "#10B981", enabled: true, lastSync: new Date(Date.now() - 60 * 60000).toISOString(), leadCount: 8 },
];

export const ASSIGNMENT_RULES: AssignmentRule[] = [
    { id: "ar1", source: "Facebook", carInterest: "SUV", assignToTeam: "SUV Sales Team", roundRobin: true },
    { id: "ar2", source: "Google", carInterest: "Sedan", assignToTeam: "Sedan Sales Team", roundRobin: true },
    { id: "ar3", source: "Offline", carInterest: undefined, assignToTeam: "Walk-in Team", roundRobin: false },
];

export const SLA_CONFIG: SLAConfig = {
    responseHours: 2,
    alertRecipients: ["se1", "se2"],
    escalateAfterHours: 4,
    escalateTo: "Business Manager",
};

export const PIPELINE_STAGES: PipelineStage[] = [
    { id: "ps1", name: "New", color: "#3B82F6", order: 0 },
    { id: "ps2", name: "Contacted", color: "#F59E0B", order: 1 },
    { id: "ps3", name: "Qualified", color: "#10B981", order: 2 },
    { id: "ps4", name: "Not Interested", color: "#EF4444", order: 3 },
    { id: "ps5", name: "Closed Won", color: "#8B5CF6", order: 4 },
    { id: "ps6", name: "Closed Lost", color: "#6B7280", order: 5 },
];

// ============================================================
// Seed data helpers
// ============================================================
const FIRST_NAMES = ["Arjun", "Kavya", "Rahul", "Ananya", "Vijay", "Sneha", "Karthik", "Divya", "Suresh", "Priya", "Manoj", "Lakshmi", "Ravi", "Nisha", "Arun", "Pooja", "Ganesh", "Shalini", "Deepak", "Meena", "Sanjay", "Rekha", "Mohan", "Geetha", "Vinod", "Bhavana", "Prakash", "Asha", "Naveen", "Usha", "Ajay", "Radha", "Ramesh", "Sunita", "Sunil", "Padma", "Adarsh", "Tanvi", "Kiran", "Madhuri", "Rohit", "Smitha", "Vikas", "Geeta", "Nitesh", "Ankita", "Siddharth", "Pallavi", "Harsh", "Renuka", "Anil", "Saritha", "Girish", "Vasantha", "Deepan", "Rashmi", "Manu", "Jyothi", "Shankar", "Varun", "Chaitra", "Tejesh", "Nandini", "Vishal", "Archana", "Chetan", "Revathi"];
const LAST_NAMES = ["Sharma", "Nair", "Patel", "Reddy", "Singh", "Kumar", "Rao", "Iyer", "Menon", "Gupta", "Joshi", "Das", "Verma", "Pillai", "Shetty", "Shah", "Hegde", "Bhat", "Gowda", "Naidu", "Desai", "Mehta", "Kapoor", "Malhotra", "Agarwal", "Bhatt", "Pandey", "Mishra", "Tiwari", "Shukla", "Yadav", "Chauhan", "Jain", "Sinha", "Mukherjee", "Banerjee", "Chatterjee", "Bose", "Sen", "Ghosh"];
const CAR_MODELS: Record<CarInterest, string[]> = {
    SUV: ["Toyota Fortuner", "Hyundai Creta", "Mahindra XUV700", "Kia Seltos", "MG Hector"],
    Sedan: ["Honda City", "Maruti Ciaz", "Hyundai Verna", "Toyota Camry", "Skoda Octavia"],
    Hatchback: ["Maruti Swift", "Hyundai Grand i10", "Tata Tiago", "Honda Jazz", "VW Polo"],
    EV: ["Tata Nexon EV", "MG ZS EV", "Hyundai Kona EV", "BYD Atto 3", "Ola S1 Pro"],
    Luxury: ["Mercedes C-Class", "BMW 3 Series", "Audi A4", "Volvo XC40", "Jaguar XE"],
    MUV: ["Toyota Innova Crysta", "Mahindra Marazzo", "Kia Carnival", "Maruti Ertiga", "Renault Triber"],
};
const CAMPAIGNS = ["Diwali Offer", "New Year Sale", "Republic Day Fest", "Summer Drive Promo", "Monsoon Deals", "Exchange Bonus", "Festival Super Savings", "Year-End Clearance"];
const BUDGETS = ["₹5L – ₹8L", "₹8L – ₹12L", "₹12L – ₹18L", "₹18L – ₹25L", "₹25L – ₹40L", "₹40L – ₹60L", "₹60L+"];
const CALL_NOTES = [
    "Customer is very interested in a test drive this weekend. Seems ready to buy.",
    "Discussed financing options. Prefers 3-year EMI plan. Will confirm budget with family.",
    "No response. Left voicemail requesting callback.",
    "Customer already visited another showroom. Considering competitor model. Need to follow up with USP.",
    "Very warm lead. Wants demo of EV charging infrastructure before committing.",
    "Interested but wife has to see the car first. Suggested weekend family visit.",
    "Negotiating trade-in value for old vehicle. Waiting for valuation team input.",
    "Call went well. Sharing brochure on WhatsApp. Scheduled test drive for Thursday.",
];

let _idCounter = 0;
function uid() { return `lead_${++_idCounter}_${Math.random().toString(36).slice(2, 7)}`; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function hoursAgo(n: number): string { return new Date(Date.now() - n * 3600000).toISOString(); }

function generatePhone(): string {
    const prefixes = ["98", "99", "91", "93", "94", "96", "97", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "70", "72", "73", "74", "75", "76", "77", "78", "79", "63", "95", "92"];
    return `+91-${pick(prefixes)}${randInt(1000, 9999)}-${String(randInt(10000, 99999)).padStart(5, '0')}`;
}

function generateActivities(leadId: string, execId: string, execName: string, status: LeadStatus, createdAt: string): ActivityLog[] {
    const activities: ActivityLog[] = [];
    const base = new Date(createdAt).getTime();
    activities.push({ id: `act_${leadId}_0`, type: 'created', description: `Lead created from ${pick(['Facebook Ad', 'Google Search', 'Website Form', 'Referral', 'Walk-in Event'])} — Campaign: ${pick(CAMPAIGNS)}`, timestamp: createdAt, userId: 'system', userName: 'System' });
    if (['Contacted', 'Qualified', 'Not Interested', 'Closed Won', 'Closed Lost'].includes(status)) {
        activities.push({ id: `act_${leadId}_1`, type: 'assigned', description: `Lead assigned to ${execName} via round-robin`, timestamp: new Date(base + 600000).toISOString(), userId: execId, userName: execName });
        activities.push({ id: `act_${leadId}_2`, type: 'call_logged', description: `Called — ${pick(['Answered: Interested in test drive', 'Answered: Wants more info', 'No Response: Voicemail left', 'Answered: Discussed financing'])}`, timestamp: new Date(base + 3600000).toISOString(), userId: execId, userName: execName });
    }
    if (['Qualified', 'Closed Won', 'Closed Lost'].includes(status)) {
        activities.push({ id: `act_${leadId}_3`, type: 'status_change', description: `Status changed: Contacted → Qualified`, timestamp: new Date(base + 86400000).toISOString(), userId: execId, userName: execName });
    }
    return activities;
}

const SOURCES: LeadSource[] = ['Facebook', 'Google', 'Twitter', 'Website', 'Offline'];
const SOURCE_WEIGHTS = [28, 21, 9, 14, 8];
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Not Interested', 'Closed Won'];
const STATUS_WEIGHTS = [18, 25, 17, 12, 8];
const CAR_TYPES: CarInterest[] = ['SUV', 'Sedan', 'Hatchback', 'EV', 'Luxury', 'MUV'];

function weightedPick<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
}

let roundRobinIndex = 0;
function nextExecutive() {
    const exec = SALES_EXECUTIVES[roundRobinIndex % SALES_EXECUTIVES.length];
    roundRobinIndex++;
    return exec;
}

function generateLead(index: number): Lead {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const source = weightedPick(SOURCES, SOURCE_WEIGHTS);
    const status = weightedPick(STATUSES, STATUS_WEIGHTS);
    const carType = pick(CAR_TYPES);
    const carModel = pick(CAR_MODELS[carType]);
    const exec = nextExecutive();
    exec.leadsAssigned++;
    let createdHoursAgo: number;
    if (index < 5) {
        createdHoursAgo = status === 'New' ? randInt(3, 8) : randInt(1, 2);
    } else {
        createdHoursAgo = randInt(1, 720);
    }
    const createdAt = hoursAgo(createdHoursAgo);
    const lastActivityHoursAgo = Math.min(createdHoursAgo, randInt(0, 48));
    const testDriveDaysFromNow = randInt(1, 14);
    const hasTestDrive = Math.random() > 0.5;
    return {
        id: uid(),
        name,
        phone: generatePhone(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(10, 999)}@gmail.com`,
        source,
        carInterest: carType,
        carModel,
        budget: pick(BUDGETS),
        testDriveDate: hasTestDrive ? new Date(Date.now() + testDriveDaysFromNow * 86400000).toISOString().slice(0, 10) : undefined,
        status,
        assignedTo: exec.id,
        assignedToName: exec.name,
        createdAt,
        lastActivity: hoursAgo(lastActivityHoursAgo),
        campaignName: source !== 'Offline' ? pick(CAMPAIGNS) : undefined,
        activities: generateActivities(uid(), exec.id, exec.name, status, createdAt),
        callLogs: Math.random() > 0.5 ? [{ id: `cl_${randInt(1000, 9999)}`, note: pick(CALL_NOTES), outcome: pick(['Answered', 'No Response', 'Call Back Later'] as const), timestamp: hoursAgo(randInt(1, 24)), userId: exec.id, userName: exec.name }] : [],
        notes: Math.random() > 0.6 ? [`Customer mentioned preference for ${pick(['dark/black color', 'petrol variant', 'automatic transmission', 'sunroof', 'large boot space', '7-seater configuration'])}.`] : [],
        isStale: status === 'New' && createdHoursAgo >= 2,
    };
}

// ============================================================
// Supabase CRUD — all functions are async
// ============================================================

/** Fetch all leads from Supabase. Seeds DB with 80 leads if empty. */
export async function getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
        .from('leads')
        .select('data')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getLeads error:', error.message);
        return [];
    }

    const leads = (data || []).map((row: { data: Lead }) => row.data);

    // Seed on first run
    if (leads.length === 0) {
        const seed = Array.from({ length: 80 }, (_, i) => generateLead(i));
        await _bulkInsert(seed);
        return seed;
    }

    // Recompute isStale in memory (time-based, no point storing it)
    return leads.map(l => ({
        ...l,
        isStale: l.status === 'New' &&
            (Date.now() - new Date(l.createdAt).getTime()) >= 2 * 3600000,
    }));
}

async function _bulkInsert(leads: Lead[]): Promise<void> {
    const rows = leads.map(l => ({ id: l.id, data: l }));
    const { error } = await supabase.from('leads').insert(rows);
    if (error) console.error('bulkInsert error:', error.message);
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
    const { data, error } = await supabase
        .from('leads')
        .select('data')
        .eq('id', id)
        .single();
    if (error || !data) return undefined;
    return data.data as Lead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const existing = await getLeadById(id);
    if (!existing) return undefined;
    const updated: Lead = { ...existing, ...updates, lastActivity: new Date().toISOString() };
    const { error } = await supabase
        .from('leads')
        .update({ data: updated })
        .eq('id', id);
    if (error) { console.error('updateLead error:', error.message); return undefined; }
    return updated;
}

export async function addLead(data: Partial<Lead>): Promise<Lead> {
    const exec = nextExecutive();
    const now = new Date().toISOString();
    const newLead: Lead = {
        id: uid(),
        name: data.name || "Unknown",
        phone: data.phone || "",
        email: data.email || "",
        source: data.source || 'Offline',
        carInterest: data.carInterest || 'SUV',
        carModel: data.carModel || pick(CAR_MODELS[data.carInterest || 'SUV']),
        budget: data.budget || pick(BUDGETS),
        testDriveDate: data.testDriveDate,
        status: 'New',
        assignedTo: exec.id,
        assignedToName: exec.name,
        createdAt: now,
        lastActivity: now,
        campaignName: data.campaignName,
        activities: [{
            id: `act_new_${Date.now()}`,
            type: 'created',
            description: `Lead created manually — source: ${data.source || 'Offline'}`,
            timestamp: now,
            userId: 'system',
            userName: 'System',
        }],
        callLogs: [],
        notes: [],
        isStale: false,
    };
    exec.leadsAssigned++;
    const { error } = await supabase.from('leads').insert({ id: newLead.id, data: newLead });
    if (error) console.error('addLead error:', error.message);
    return newLead;
}

export async function addCallLog(leadId: string, callLog: CallLog): Promise<void> {
    const lead = await getLeadById(leadId);
    if (!lead) return;
    const activity: ActivityLog = {
        id: `act_call_${Date.now()}`,
        type: 'call_logged',
        description: `Called — ${callLog.outcome}: ${callLog.note.slice(0, 60)}${callLog.note.length > 60 ? '...' : ''}`,
        timestamp: callLog.timestamp,
        userId: callLog.userId,
        userName: callLog.userName,
    };
    await updateLead(leadId, {
        callLogs: [callLog, ...(lead.callLogs || [])],
        activities: [activity, ...(lead.activities || [])],
    });
}

export async function addNote(leadId: string, note: string): Promise<void> {
    const lead = await getLeadById(leadId);
    if (!lead) return;
    const activity: ActivityLog = {
        id: `act_note_${Date.now()}`,
        type: 'note_added',
        description: `Note added: ${note.slice(0, 60)}...`,
        timestamp: new Date().toISOString(),
        userId: 'current_user',
        userName: 'You',
    };
    await updateLead(leadId, {
        notes: [note, ...(lead.notes || [])],
        activities: [activity, ...(lead.activities || [])],
    });
}

/**
 * Permanently delete a lead and store the reason in the audit table.
 * Only call this for leads that are 'Not Interested' or 'Closed Lost'.
 */
export async function deleteLead(id: string, reason: string): Promise<void> {
    const lead = await getLeadById(id);
    // Write to audit table first
    await supabase.from('deleted_leads').insert({
        id,
        lead_name: lead?.name ?? 'Unknown',
        lead_source: lead?.source ?? 'Unknown',
        lead_status: lead?.status ?? 'Unknown',
        reason,
        deleted_at: new Date().toISOString(),
    });
    // Then delete from leads
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) console.error('deleteLead error:', error.message);
}

// ============================================================
// Real-time simulation — new lead every 90s
// ============================================================
export function startRealTimeSimulation(onNewLead: (lead: Lead) => void) {
    const interval = setInterval(async () => {
        const newLead = generateLead(999);
        await addLead(newLead);
        onNewLead(newLead);
    }, 90000);
    return () => clearInterval(interval);
}

// ============================================================
// Dashboard stats — computed from lead array
// ============================================================
const SOURCE_COLORS: Record<LeadSource, string> = {
    Facebook: '#1877F2', Google: '#EA4335', Twitter: '#1DA1F2',
    Website: '#6366F1', Offline: '#10B981',
};
const STATUS_COLORS: Record<LeadStatus, string> = {
    'New': '#3B82F6', 'Contacted': '#F59E0B', 'Qualified': '#10B981',
    'Not Interested': '#EF4444', 'Closed Won': '#8B5CF6', 'Closed Lost': '#6B7280',
};

export async function computeDashboardStats(): Promise<DashboardStats> {
    const leads = await getLeads();
    const now = Date.now();
    const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const lastMonthStart = new Date(monthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const thisMonth = leads.filter(l => new Date(l.createdAt) >= monthStart);
    const lastMonth = leads.filter(l => new Date(l.createdAt) >= lastMonthStart && new Date(l.createdAt) < monthStart);
    const sourceSums: Record<LeadSource, number> = { Facebook: 0, Google: 0, Twitter: 0, Website: 0, Offline: 0 };
    leads.forEach(l => { sourceSums[l.source] = (sourceSums[l.source] || 0) + 1; });

    const leadsByDay: DashboardStats['leadsByDay'] = [];
    for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(now - i * 86400000); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const dayLeads = leads.filter(l => { const t = new Date(l.createdAt).getTime(); return t >= dayStart.getTime() && t < dayEnd.getTime(); });
        const entry: DashboardStats['leadsByDay'][0] = { date: dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), total: dayLeads.length, Facebook: 0, Google: 0, Twitter: 0, Website: 0, Offline: 0 };
        dayLeads.forEach(l => { entry[l.source] = (entry[l.source] || 0) + 1; });
        leadsByDay.push(entry);
    }

    const teamPerformance: TeamPerformance[] = SALES_EXECUTIVES.map(exec => {
        const myLeads = leads.filter(l => l.assignedTo === exec.id);
        return {
            executive: exec, leadsAssigned: myLeads.length,
            contacted: myLeads.filter(l => ['Contacted', 'Qualified', 'Closed Won'].includes(l.status)).length,
            qualified: myLeads.filter(l => ['Qualified', 'Closed Won'].includes(l.status)).length,
            closedWon: myLeads.filter(l => l.status === 'Closed Won').length,
            avgResponseTimeHrs: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
        };
    });

    const allActivities = leads.flatMap(l => l.activities || []);
    const recent = allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

    return {
        totalLeads: thisMonth.length,
        totalLeadsLastMonth: lastMonth.length,
        qualifiedLeads: thisMonth.filter(l => ['Qualified', 'Closed Won'].includes(l.status)).length,
        qualifiedLeadsLastMonth: lastMonth.filter(l => ['Qualified', 'Closed Won'].includes(l.status)).length,
        avgResponseTimeHrs: 1.4,
        closedWon: thisMonth.filter(l => l.status === 'Closed Won').length,
        closedWonLastMonth: lastMonth.filter(l => l.status === 'Closed Won').length,
        leadsBySource: SOURCES.map(s => ({ source: s, count: sourceSums[s], color: SOURCE_COLORS[s] })),
        leadStatusFunnel: [
            { status: 'New', count: leads.filter(l => l.status === 'New').length, color: STATUS_COLORS['New'] },
            { status: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: STATUS_COLORS['Contacted'] },
            { status: 'Qualified', count: leads.filter(l => l.status === 'Qualified').length, color: STATUS_COLORS['Qualified'] },
            { status: 'Not Interested', count: leads.filter(l => l.status === 'Not Interested').length, color: STATUS_COLORS['Not Interested'] },
            { status: 'Closed Won', count: leads.filter(l => l.status === 'Closed Won').length, color: STATUS_COLORS['Closed Won'] },
        ],
        leadsByDay,
        teamPerformance,
        recentActivity: recent,
    };
}

// ============================================================
// Utilities (pure functions — no async needed)
// ============================================================
export function getRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function getStatusColor(status: LeadStatus): { bg: string; text: string; border: string } {
    const map: Record<LeadStatus, { bg: string; text: string; border: string }> = {
        'New': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
        'Contacted': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
        'Qualified': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        'Not Interested': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
        'Closed Won': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
        'Closed Lost': { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    return map[status] || { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
}

export function getSourceIcon(source: LeadSource): string {
    const icons: Record<LeadSource, string> = {
        Facebook: 'FB', Google: 'GO', Twitter: 'TW', Website: 'WB', Offline: 'OF',
    };
    return icons[source];
}

export function getSourceColor(source: LeadSource): string {
    return SOURCE_COLORS[source] || '#94A3B8';
}
