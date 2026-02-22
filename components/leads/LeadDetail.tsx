import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, CallOutcome, CallLog, ActivityLog } from '../../types';
import {
    getLeadById, updateLead, addCallLog, addNote, deleteLead,
    getRelativeTime, getStatusColor, getSourceIcon, SALES_EXECUTIVES,
} from '../../services/dataService';
import { generateCallSummary } from '../../services/geminiService';

interface LeadDetailProps {
    leadId: string;
    onBack: () => void;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Not Interested', 'Closed Won', 'Closed Lost'];
const OUTCOMES: CallOutcome[] = ['Answered', 'No Response', 'Call Back Later'];

const ActivityIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
    const map: Record<ActivityLog['type'], { svgPath: string; bg: string }> = {
        created: { svgPath: 'M12 4v16m8-8H4', bg: 'bg-blue-500/20' },
        status_change: { svgPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', bg: 'bg-amber-500/20' },
        call_logged: { svgPath: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', bg: 'bg-emerald-500/20' },
        note_added: { svgPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', bg: 'bg-purple-500/20' },
        assigned: { svgPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'bg-violet-500/20' },
        callback_scheduled: { svgPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'bg-indigo-500/20' },
    };
    const { svgPath, bg } = map[type] || { svgPath: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', bg: 'bg-slate-500/20' };
    return (
        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
            <svg className="w-4 h-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
            </svg>
        </div>
    );
};

export const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onBack }) => {
    const [lead, setLead] = useState<Lead | null>(null);
    const [status, setStatus] = useState<LeadStatus>('New');
    const [assignedTo, setAssignedTo] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Call log form
    const [callNote, setCallNote] = useState('');
    const [callOutcome, setCallOutcome] = useState<CallOutcome>('Answered');
    const [logSubmitting, setLogSubmitting] = useState(false);
    const [aiSummary, setAiSummary] = useState<{ summary: string; nextAction: string } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [showCallbackPrompt, setShowCallbackPrompt] = useState(false);
    const [callbackDate, setCallbackDate] = useState('');
    const [callbackTime, setCallbackTime] = useState('');

    // Note form
    const [noteText, setNoteText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Load lead on mount
    useEffect(() => {
        getLeadById(leadId).then(l => {
            if (l) { setLead(l); setStatus(l.status); setAssignedTo(l.assignedTo); }
            setIsLoading(false);
        });
    }, [leadId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Lead not found.</div>
            </div>
        );
    }

    const reload = async () => {
        const l = await getLeadById(leadId);
        if (l) setLead({ ...l });
    };

    const handleStatusChange = async (newStatus: LeadStatus) => {
        setStatus(newStatus);
        const activity: ActivityLog = {
            id: `act_sc_${Date.now()}`,
            type: 'status_change',
            description: `Status changed: ${lead.status} → ${newStatus}`,
            timestamp: new Date().toISOString(),
            userId: 'current_user',
            userName: 'You',
        };
        await updateLead(leadId, {
            status: newStatus,
            activities: [activity, ...(lead.activities || [])],
        });
        await reload();
    };

    const handleReassign = async (execId: string) => {
        const exec = SALES_EXECUTIVES.find(e => e.id === execId);
        if (!exec) return;
        setAssignedTo(execId);
        const activity: ActivityLog = {
            id: `act_re_${Date.now()}`,
            type: 'assigned',
            description: `Lead reassigned to ${exec.name}`,
            timestamp: new Date().toISOString(),
            userId: 'current_user',
            userName: 'You',
        };
        await updateLead(leadId, {
            assignedTo: exec.id,
            assignedToName: exec.name,
            activities: [activity, ...(lead.activities || [])],
        });
        await reload();
    };

    const handleLogCall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!callNote.trim()) return;
        setLogSubmitting(true);
        const cl: CallLog = {
            id: `cl_${Date.now()}`,
            note: callNote,
            outcome: callOutcome,
            timestamp: new Date().toISOString(),
            userId: 'current_user',
            userName: 'You',
        };
        await addCallLog(leadId, cl);
        await reload();
        setCallNote('');
        setLogSubmitting(false);
        if (callOutcome === 'Call Back Later') {
            setShowCallbackPrompt(true);
        }
    };

    const handleSummarize = async () => {
        if (!callNote.trim() && (lead.callLogs || []).length === 0) return;
        setAiLoading(true);
        setAiSummary(null);
        const noteToSummarize = callNote.trim() || lead.callLogs?.[0]?.note || '';
        const result = await generateCallSummary(noteToSummarize, lead.name, lead.carModel);
        setAiSummary(result);
        setAiLoading(false);
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        await addNote(leadId, noteText);
        setNoteText('');
        await reload();
    };

    const handleCallbackSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!callbackDate || !callbackTime) return;
        const activity: ActivityLog = {
            id: `act_cb_${Date.now()}`,
            type: 'callback_scheduled',
            description: `Callback scheduled for ${callbackDate} at ${callbackTime}`,
            timestamp: new Date().toISOString(),
            userId: 'current_user',
            userName: 'You',
        };
        await updateLead(leadId, { activities: [activity, ...(lead.activities || [])] });
        setShowCallbackPrompt(false);
        await reload();
    };

    const handleDeleteLead = async () => {
        if (!deleteReason.trim()) return;
        setIsDeleting(true);
        await deleteLead(leadId, deleteReason.trim());
        onBack();
    };

    const sc = getStatusColor(status);

    return (
        <div className="max-w-[1400px] mx-auto p-6">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button onClick={onBack} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        All Leads
                    </button>
                    <span>›</span>
                    <span className="text-slate-300">{lead.name}</span>
                </div>
                {(status === 'Not Interested' || status === 'Closed Lost') && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove Lead
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── Left Column (70%) ── */}
                <div className="flex-1 space-y-5">

                    {/* Lead Header Card */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-6">
                        <div className="flex items-start gap-5">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>{status}</span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1.5">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-white/10 text-slate-300">{getSourceIcon(lead.source)}</span>
                                        {lead.source}
                                    </span>
                                    {lead.campaignName && (
                                        <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs">
                                            {lead.campaignName}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                    {[
                                        { label: 'Phone', val: lead.phone },
                                        { label: 'Email', val: lead.email },
                                        { label: 'Car Interest', val: `${lead.carModel} (${lead.carInterest})` },
                                        { label: 'Budget', val: lead.budget },
                                        { label: 'Test Drive', val: lead.testDriveDate || 'Not scheduled' },
                                        { label: 'Added', val: getRelativeTime(lead.createdAt) },
                                    ].map(({ label, val }) => (
                                        <div key={label}>
                                            <div className="text-xs text-slate-500 font-medium">{label}</div>
                                            <div className="text-slate-200 truncate">{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp / Call CTA */}
                        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3 flex-wrap">
                            <a
                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-lg border border-emerald-500/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14l4-4h16a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                                WhatsApp
                            </a>
                            <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-lg border border-blue-500/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                Call
                            </a>
                            <span className="text-xs text-slate-500 ml-auto">Assigned to: <span className="text-slate-300 font-medium">{lead.assignedToName}</span></span>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-6">
                        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                            Activity Timeline
                        </h3>
                        <div className="relative space-y-5">
                            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/[0.05]"></div>
                            {(lead.activities || []).length === 0 ? (
                                <p className="text-slate-500 text-sm pl-8">No activity yet.</p>
                            ) : (
                                (lead.activities || []).map(act => (
                                    <div key={act.id} className="flex items-start gap-4 relative">
                                        <ActivityIcon type={act.type} />
                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className="text-sm text-slate-200">{act.description}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{getRelativeTime(act.timestamp)} · {act.userName}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Call Logs & Notes */}
                    {(lead.callLogs || []).length > 0 && (
                        <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-6">
                            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                                Call History
                            </h3>
                            <div className="space-y-4">
                                {(lead.callLogs || []).map(cl => (
                                    <div key={cl.id} className="bg-[#0d1117] rounded-xl p-4 border border-white/[0.05]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cl.outcome === 'Answered' ? 'bg-emerald-500/15 text-emerald-400' : cl.outcome === 'Call Back Later' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                                                {cl.outcome}
                                            </span>
                                            <span className="text-xs text-slate-500">{getRelativeTime(cl.timestamp)} · {cl.userName}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{cl.note}</p>
                                        {cl.aiSummary && (
                                            <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                                                <p className="text-xs font-semibold text-indigo-400 mb-1">AI Summary</p>
                                                <p className="text-xs text-slate-300">{cl.aiSummary}</p>
                                                <p className="text-xs text-emerald-400 mt-1">→ {cl.aiNextAction}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {(lead.notes || []).length > 0 && (
                        <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-6">
                            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-purple-500 rounded-full"></span>Notes
                            </h3>
                            <div className="space-y-3">
                                {(lead.notes || []).map((note, i) => (
                                    <div key={i} className="bg-[#0d1117] rounded-xl p-4 border border-white/[0.05]">
                                        <p className="text-sm text-slate-300">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Column (30%) ── */}
                <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4">

                    {/* Status Selector */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lead Status</label>
                        <select
                            value={status}
                            onChange={e => handleStatusChange(e.target.value as LeadStatus)}
                            className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        >
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Assign To */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign To</label>
                        <select
                            value={assignedTo}
                            onChange={e => handleReassign(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        >
                            {SALES_EXECUTIVES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    {/* Log a Call */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Log a Call</h4>
                        <form onSubmit={handleLogCall} className="space-y-3">
                            <select
                                value={callOutcome}
                                onChange={e => setCallOutcome(e.target.value as CallOutcome)}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            >
                                {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                            </select>
                            <textarea
                                value={callNote}
                                onChange={e => setCallNote(e.target.value)}
                                placeholder="Call notes..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={logSubmitting || !callNote.trim()}
                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    Log Call
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSummarize}
                                    disabled={aiLoading || (!callNote.trim() && (lead.callLogs || []).length === 0)}
                                    className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
                                >
                                    {aiLoading ? 'Analyzing...' : 'AI Summarize'}
                                </button>
                            </div>
                        </form>

                        {/* AI Summary Result */}
                        {aiSummary && (
                            <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                                <p className="text-xs font-semibold text-indigo-400 mb-1.5">AI Call Summary</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{aiSummary.summary}</p>
                                <div className="mt-2 pt-2 border-t border-indigo-500/10">
                                    <p className="text-xs text-emerald-400 font-semibold">Suggested Next Action:</p>
                                    <p className="text-xs text-slate-300 mt-0.5">{aiSummary.nextAction}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Note */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Add Note</h4>
                        <form onSubmit={handleAddNote} className="space-y-3">
                            <textarea
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Internal note..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={!noteText.trim()}
                                className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
                            >
                                Save Note
                            </button>
                        </form>
                    </div>

                    {/* Schedule Callback */}
                    <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule Callback</h4>
                        <form onSubmit={handleCallbackSchedule} className="space-y-3">
                            <input
                                type="date"
                                value={callbackDate}
                                onChange={e => setCallbackDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <input
                                type="time"
                                value={callbackTime}
                                onChange={e => setCallbackTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <button
                                type="submit"
                                disabled={!callbackDate || !callbackTime}
                                className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-300 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
                            >
                                Schedule Callback
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Auto Callback Prompt Modal */}
            {showCallbackPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative z-10 bg-[#161b22] border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Set Callback Time?</h3>
                        <p className="text-sm text-slate-400 mb-4">You selected "Call Back Later". Would you like to schedule a callback reminder?</p>
                        <form onSubmit={handleCallbackSchedule} className="space-y-3">
                            <input type="date" value={callbackDate} onChange={e => setCallbackDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
                            <input type="time" value={callbackTime} onChange={e => setCallbackTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowCallbackPrompt(false)}
                                    className="flex-1 py-2.5 bg-white/[0.04] text-slate-300 text-sm font-semibold rounded-lg border border-white/[0.07] hover:bg-white/[0.08] transition-colors">
                                    Skip
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors">
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Lead Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { if (!isDeleting) setShowDeleteConfirm(false); }} />
                    <div className="relative z-10 bg-[#161b22] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Remove this lead?</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            <span className="text-white font-semibold">{lead.name}</span> will be permanently removed. This cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                Reason for removal <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={e => setDeleteReason(e.target.value)}
                                placeholder="e.g. Customer not interested, bought from competitor..."
                                rows={3}
                                className="w-full px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-white/[0.04] text-slate-300 text-sm font-semibold rounded-lg border border-white/[0.07] hover:bg-white/[0.08] transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteLead}
                                disabled={!deleteReason.trim() || isDeleting}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Removing...' : 'Remove Lead'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
