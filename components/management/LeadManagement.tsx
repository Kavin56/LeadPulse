import React, { useState } from 'react';
import {
    LeadSource_Config, AssignmentRule, SLAConfig, PipelineStage,
    LeadSource, CarInterest, LeadStatus,
} from '../../types';
import {
    SOURCE_CONFIG, ASSIGNMENT_RULES, SLA_CONFIG, PIPELINE_STAGES, SALES_EXECUTIVES,
} from '../../services/dataService';

const SOURCES: LeadSource[] = ['Facebook', 'Google', 'Twitter', 'Website', 'Offline'];
const CAR_TYPES: CarInterest[] = ['SUV', 'Sedan', 'Hatchback', 'EV', 'Luxury', 'MUV'];

// ──────────────────────────────────────────────────────────────
// Tab Button
// ──────────────────────────────────────────────────────────────
const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${active ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'}`}
    >
        {children}
    </button>
);

// ──────────────────────────────────────────────────────────────
// 3a — Lead Sources
// ──────────────────────────────────────────────────────────────
const LeadSourcesTab: React.FC = () => {
    const [sources, setSources] = useState<LeadSource_Config[]>(SOURCE_CONFIG);
    const [copied, setCopied] = useState(false);
    const webhookUrl = 'https://api.leadpulse.hsrmotors.com/v1/webhooks/ingest/wh_k9x2p7m4q1r8';

    const toggle = (id: string) => {
        setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    const copyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-5">
            {/* Webhook */}
            <div className="bg-[#0d1117] rounded-xl p-4 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span className="text-violet-400 text-sm font-semibold">Webhook URL for Offline Lead Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-slate-300 bg-[#161b22] border border-white/[0.06] rounded-lg px-3 py-2 font-mono truncate">
                        {webhookUrl}
                    </code>
                    <button
                        onClick={copyWebhook}
                        className="px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-semibold rounded-lg border border-violet-500/20 transition-colors whitespace-nowrap"
                    >
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Sources Table */}
            <div className="bg-[#161b22] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                    <h3 className="text-sm font-semibold text-white">Connected Lead Sources</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/25 transition-colors">
                        + Connect New Source
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.05] bg-[#0d1117]/40">
                            {['Source', 'Status', 'Last Sync', 'Leads', 'Enabled'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {sources.map(src => (
                            <tr key={src.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: src.color + '25', color: src.color }}>
                                            {src.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-white">{src.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${src.enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
                                        {src.enabled ? '● Active' : '○ Paused'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-400">
                                    {new Date(src.lastSync).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-5 py-4">
                                    <span className="text-sm text-white font-semibold">{src.leadCount}</span>
                                    <span className="text-xs text-slate-500 ml-1">leads</span>
                                </td>
                                <td className="px-5 py-4">
                                    <button
                                        onClick={() => toggle(src.id)}
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${src.enabled ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${src.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// 3b — Assignment Rules
// ──────────────────────────────────────────────────────────────
const AssignmentRulesTab: React.FC = () => {
    const [rules, setRules] = useState<AssignmentRule[]>(ASSIGNMENT_RULES);
    const [roundRobinGlobal, setRoundRobinGlobal] = useState(true);

    const removeRule = (id: string) => setRules(r => r.filter(rule => rule.id !== id));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-white/[0.05]">
                <div>
                    <div className="text-sm font-semibold text-white">Global Round-Robin</div>
                    <div className="text-xs text-slate-500 mt-0.5">Auto-distribute new leads evenly across the team</div>
                </div>
                <button
                    onClick={() => setRoundRobinGlobal(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${roundRobinGlobal ? 'bg-indigo-500' : 'bg-slate-600'}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${roundRobinGlobal ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="space-y-3">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-[#161b22] border border-white/[0.07] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignment Rule</span>
                            <button onClick={() => removeRule(rule.id)} className="text-slate-600 hover:text-red-400 text-sm transition-colors">✕ Remove</button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                            <span className="text-slate-400">If source is</span>
                            <span className="px-3 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-lg font-semibold">{rule.source || 'Any'}</span>
                            {rule.carInterest && (
                                <>
                                    <span className="text-slate-400">AND car is</span>
                                    <span className="px-3 py-1 bg-violet-500/15 text-violet-300 border border-violet-500/20 rounded-lg font-semibold">{rule.carInterest}</span>
                                </>
                            )}
                            <span className="text-slate-400">→ assign to</span>
                            <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded-lg font-semibold">{rule.assignToTeam}</span>
                            {rule.roundRobin && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">Round-robin</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-3 border-2 border-dashed border-white/[0.1] rounded-xl text-slate-500 hover:text-slate-300 hover:border-indigo-500/30 text-sm font-semibold transition-all">
                + Add Assignment Rule
            </button>

            <div className="p-4 bg-[#0d1117] rounded-xl border border-white/[0.05]">
                <div className="text-xs font-semibold text-slate-400 mb-1">Fallback Rule</div>
                <p className="text-sm text-slate-300">Unmatched leads → Assign to <span className="text-indigo-400">Rohan Sharma</span> (Team Lead)</p>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// 3c — SLA & Alerts
// ──────────────────────────────────────────────────────────────
const SLATab: React.FC = () => {
    const [config, setConfig] = useState<SLAConfig>(SLA_CONFIG);
    const [saved, setSaved] = useState(false);

    const save = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-5">
            <div className="bg-[#161b22] border border-white/[0.07] rounded-xl p-5 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-white mb-1">Response Time SLA</label>
                    <p className="text-xs text-slate-500 mb-3">New leads must be contacted within this time</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="number" min="1" max="24"
                            value={config.responseHours}
                            onChange={e => setConfig(c => ({ ...c, responseHours: Number(e.target.value) }))}
                            className="w-24 px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-center font-bold"
                        />
                        <span className="text-slate-400 text-sm">hours</span>
                        <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Alerts trigger after this
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-1">Escalation Rule</label>
                    <p className="text-xs text-slate-500 mb-3">If not contacted within this time, escalate to manager</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="number" min="1" max="72"
                            value={config.escalateAfterHours}
                            onChange={e => setConfig(c => ({ ...c, escalateAfterHours: Number(e.target.value) }))}
                            className="w-24 px-3 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-center font-bold"
                        />
                        <span className="text-slate-400 text-sm">hours</span>
                        <span className="text-slate-400 text-sm">→</span>
                        <span className="text-indigo-300 text-sm font-semibold">Business Manager</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-3">Alert Recipients</label>
                    <div className="space-y-2">
                        {SALES_EXECUTIVES.map(exec => (
                            <label key={exec.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={config.alertRecipients.includes(exec.id)}
                                    onChange={e => {
                                        setConfig(c => ({
                                            ...c,
                                            alertRecipients: e.target.checked
                                                ? [...c.alertRecipients, exec.id]
                                                : c.alertRecipients.filter(id => id !== exec.id),
                                        }));
                                    }}
                                    className="w-4 h-4 accent-indigo-500"
                                />
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">{exec.avatar}</div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{exec.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={save}
                    className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                    {saved ? '✓ Saved!' : 'Save SLA Configuration'}
                </button>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// 3d — Pipeline Stages
// ──────────────────────────────────────────────────────────────
const PipelineTab: React.FC = () => {
    const [stages, setStages] = useState<PipelineStage[]>([...PIPELINE_STAGES].sort((a, b) => a.order - b.order));
    const [dragIdx, setDragIdx] = useState<number | null>(null);

    const onDragStart = (idx: number) => setDragIdx(idx);
    const onDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        const next = [...stages];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(idx, 0, moved);
        next.forEach((s, i) => { s.order = i; });
        setStages(next);
        setDragIdx(idx);
    };
    const onDragEnd = () => setDragIdx(null);

    const rename = (id: string, name: string) =>
        setStages(prev => prev.map(s => s.id === id ? { ...s, name } : s));

    const setColor = (id: string, color: string) =>
        setStages(prev => prev.map(s => s.id === id ? { ...s, color } : s));

    return (
        <div className="space-y-4">
            <p className="text-xs text-slate-500">Drag to reorder stages. Click name to rename.</p>
            <div className="space-y-3">
                {stages.map((stage, idx) => (
                    <div
                        key={stage.id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={e => onDragOver(e, idx)}
                        onDragEnd={onDragEnd}
                        className={`flex items-center gap-4 p-4 bg-[#161b22] border rounded-xl cursor-grab active:cursor-grabbing transition-all ${dragIdx === idx ? 'border-indigo-500/60 bg-indigo-500/5 scale-[1.02]' : 'border-white/[0.07] hover:border-white/[0.12]'}`}
                    >
                        <span className="text-slate-600 cursor-grab">⠿⠿</span>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }}></div>
                        <input
                            value={stage.name}
                            onChange={e => rename(stage.id, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-white focus:outline-none border-b border-transparent focus:border-indigo-500/50"
                        />
                        <input
                            type="color"
                            value={stage.color}
                            onChange={e => setColor(stage.id, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] p-0.5"
                        />
                        <span className="text-xs text-slate-600 w-16 text-right">Order #{idx + 1}</span>
                    </div>
                ))}
            </div>
            <button className="w-full py-3 border-2 border-dashed border-white/[0.1] rounded-xl text-slate-500 hover:text-slate-300 hover:border-indigo-500/30 text-sm font-semibold transition-all">
                + Add Custom Stage
            </button>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────
const TABS = ['Lead Sources', 'Assignment Rules', 'SLA & Alerts', 'Pipeline Stages'];

export const LeadManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(true);

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Lead Management</h1>
                <p className="text-sm text-slate-400 mt-0.5">Configure sources, assignment rules, SLAs, and pipeline stages</p>
            </div>

            {/* Duplicate Detection Alert */}
            {showDuplicateAlert && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/25 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-amber-300">Duplicate Lead Detected</div>
                        <p className="text-xs text-slate-400 mt-1">
                            3 leads share phone numbers with existing records. Would you like to <button className="text-amber-400 underline">review & merge</button> or <button className="text-slate-400 underline">keep separate</button>?
                        </p>
                    </div>
                    <button onClick={() => setShowDuplicateAlert(false)} className="text-slate-500 hover:text-white transition-colors text-sm">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#0d1117] border border-white/[0.06] rounded-xl flex-wrap">
                {TABS.map((tab, i) => (
                    <TabBtn key={tab} active={activeTab === i} onClick={() => setActiveTab(i)}>{tab}</TabBtn>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 0 && <LeadSourcesTab />}
                {activeTab === 1 && <AssignmentRulesTab />}
                {activeTab === 2 && <SLATab />}
                {activeTab === 3 && <PipelineTab />}
            </div>
        </div>
    );
};
