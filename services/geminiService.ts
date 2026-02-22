import { GoogleGenAI } from "@google/genai";
import { DashboardStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const MODEL = "gemini-3.1-pro-preview";

// ============================================================
// Feature 1: AI Call Summary (Screen 2 — Lead Details)
// ============================================================
export const generateCallSummary = async (
  noteText: string,
  leadName: string,
  carInterest: string
): Promise<{ summary: string; nextAction: string }> => {
  const prompt = `You are an AI assistant for HSR Motors, a car dealership. A sales executive just logged a call with a lead.

Lead Name: ${leadName}
Car of Interest: ${carInterest}
Call Note: "${noteText}"

Generate:
1. A concise 1-2 sentence professional summary of this call
2. A specific, actionable next step recommendation

Return as JSON:
{
  "summary": "...",
  "nextAction": "..."
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = (response.text || "{}").replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || "Call summary unavailable.",
      nextAction: parsed.nextAction || "Follow up within 24 hours.",
    };
  } catch (error) {
    console.error("Call summary generation failed:", error);
    return {
      summary: "Unable to generate summary at this time.",
      nextAction: "Please review notes manually and follow up.",
    };
  }
};

// ============================================================
// Feature 2: Natural Language Dashboard Query (Screen 4 — Dashboard)
// ============================================================
export const answerDashboardQuery = async (
  question: string,
  stats: DashboardStats
): Promise<string> => {
  const contextSummary = `
Dashboard Data Summary (as of today):
- Total Leads This Month: ${stats.totalLeads} (vs ${stats.totalLeadsLastMonth} last month)
- Qualified Leads: ${stats.qualifiedLeads} (${Math.round((stats.qualifiedLeads / stats.totalLeads) * 100)}% conversion)
- Avg Response Time: ${stats.avgResponseTimeHrs} hours
- Closed Won: ${stats.closedWon}

Leads by Source:
${stats.leadsBySource.map(s => `  - ${s.source}: ${s.count} leads`).join('\n')}

Lead Status Funnel:
${stats.leadStatusFunnel.map(s => `  - ${s.status}: ${s.count}`).join('\n')}

Team Performance:
${stats.teamPerformance.map(t => `  - ${t.executive.name}: ${t.leadsAssigned} assigned, ${t.contacted} contacted, ${t.qualified} qualified, ${t.closedWon} closed, ${t.avgResponseTimeHrs}h avg response`).join('\n')}
`;

  const prompt = `You are a business intelligence assistant for HSR Motors dealership. Answer the following question using the dashboard data provided. Be concise (1-3 sentences), specific with numbers, and insightful.

${contextSummary}

Question: "${question}"

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text?.trim() || "Unable to answer at this time.";
  } catch (error) {
    console.error("NL query failed:", error);
    return "Unable to process your query at this time. Please try again.";
  }
};