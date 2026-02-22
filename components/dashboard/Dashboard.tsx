import React, { useState, useEffect, useRef } from 'react';
import {
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DashboardStats, TeamPerformance } from '../../types';
import { computeDashboardStats, getRelativeTime } from '../../services/dataService';
import { answerDashboardQuery } from '../../services/geminiService';

// ──────────────────────────────────────────────────────────────
// KPI Card
// ──────────────────────────────────────────────────────────────
const KPICard: React.FC<{
    title: string;
    value: string | number;
    sub?: string;
    pct?: number;
    iconPath: string;
    color: string;
}> = ({ title, value, sub, pct, iconPath, color }) => {
    const positive = (pct ?? 0) >= 0;
    return (
        <div className={`bg-[#161b22] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -translate-y-8 translate-x-8`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <svg className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                </div>
                {pct !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {positive ? '↑' : '↓'} {Math.abs(pct).toFixed(0)}%
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400">{title}</div>
            {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────────
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1e2530] border border-white/[0.1] rounded-xl p-3 text-xs shadow-xl">
            {label && <div className="text-slate-400 mb-2 font-semibold">{label}</div>}
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
                    <span className="text-slate-300">{entry.name}:</span>
                    <span className="text-white font-semibold">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// NL Query Bar
// ──────────────────────────────────────────────────────────────
const NLQueryBar: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const SUGGESTIONS = [
        'How many leads came from Facebook this week?',
        'Who is the best performing sales executive?',
        'What is our current lead conversion rate?',
        'How many leads are qualified this month?',
    ];

    const ask = async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        setAnswer('');
        const result = await answerDashboardQuery(q, stats);
        setAnswer(result);
        setLoading(false);
    };

    return (
        <div className="bg-[#161b22] border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-indigo-400 text-sm font-semibold">Natural Language Query</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20">AI Powered</span>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && ask(query)}
                    placeholder="Ask anything about your dashboard data…"
                    className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-white/[0.07] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
                <button
                    onClick={() => ask(query)}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : 'Ask'}
                </button>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
                {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => { setQuery(s); ask(s); }}
                        className="px-2.5 py-1 bg-[#0d1117] border border-white/[0.06] rounded-full text-[11px] text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">
                        {s}
                    </button>
                ))}
            </div>
            {/* Answer */}
            {(loading || answer) && (
                <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                            Analyzing dashboard data…
                        </div>
                    ) : (
                        <>
                            <div className="text-xs text-indigo-400 mb-1.5 font-semibold">AI Answer</div>
                            <p className="text-sm text-slate-200 leading-relaxed">{answer}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// Team Performance Table
// ──────────────────────────────────────────────────────────────
const TeamTable: React.FC<{ data: TeamPerformance[]; onDrillDown: (execId: string) => void }> = ({ data, onDrillDown }) => {
    const [sortKey, setSortKey] = useState<keyof TeamPerformance>('leadsAssigned');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sorted = [...data].sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        return sortDir === 'asc' ? av - bv : bv - av;
    });

    const toggleSort = (key: keyof TeamPerformance) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ field }: { field: keyof TeamPerformance }) => (
        <span className={`ml-1 text-[10px] ${sortKey === field ? 'text-indigo-400' : 'text-slate-600'}`}>
            {sortKey === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    const cols: { label: string; key: keyof TeamPerformance }[] = [
        { label: 'Sales Executive', key: 'leadsAssigned' },
        { label: 'Assigned', key: 'leadsAssigned' },
        { label: 'Contacted', key: 'contacted' },
        { label: 'Qualified', key: 'qualified' },
        { label: 'Closed Won', key: 'closedWon' },
        { label: 'Avg. Response', key: 'avgResponseTimeHrs' },
    ];

    return (
        <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.07]">
                <h3 className="text-sm font-semibold text-white">Team Performance</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.05] bg-[#0d1117]/40">
                            {cols.map(col => (
                                <th
                                    key={col.label}
                                    onClick={() => col.key !== 'leadsAssigned' || col.label === 'Assigned' ? toggleSort(col.key) : undefined}
                                    className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                >
                                    {col.label}
                                    {col.label !== 'Sales Executive' && <SortIcon field={col.key} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {sorted.map(row => (
                            <tr
                                key={row.executive.id}
                                onClick={() => onDrillDown(row.executive.id)}
                                className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                                            {row.executive.avatar}
                                        </div>
                                        <span className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{row.executive.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-300 font-semibold">{row.leadsAssigned}</td>
                                <td className="px-5 py-4 text-sm text-slate-300">{row.contacted}</td>
                                <td className="px-5 py-4 text-sm text-emerald-400">{row.qualified}</td>
                                <td className="px-5 py-4">
                                    <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">{row.closedWon}</span>
                                </td>
                                <td className="px-5 py-4 text-sm text-amber-400 font-medium">{row.avgResponseTimeHrs}h</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// Live Activity Feed
// ──────────────────────────────────────────────────────────────
const ActivityFeedItem: React.FC<{ description: string; timestamp: string; userName: string }> = ({ description, timestamp, userName }) => (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-300 flex-shrink-0">
            {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{getRelativeTime(timestamp)} · {userName}</p>
        </div>
    </div>
);

// ──────────────────────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────────────────────
export const Dashboard: React.FC<{ onDrillDown: (execId: string) => void }> = ({ onDrillDown }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [anomaly, setAnomaly] = useState(true);

    const loadStats = async () => {
        const s = await computeDashboardStats();
        setStats(s);
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const pctChange = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;

    const SOURCE_COLORS = { Facebook: '#1877F2', Google: '#EA4335', Twitter: '#1DA1F2', Website: '#6366F1', Offline: '#10B981' };

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Real-time overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-white/[0.07] rounded-lg text-slate-400 hover:text-white text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-white/[0.07] rounded-lg text-slate-400 hover:text-white text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Subscribe Report
                    </button>
                </div>
            </div>

            {/* Anomaly Alert */}
            {anomaly && (
                <div className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/25 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-red-300">Lead Volume Anomaly Detected</div>
                        <p className="text-xs text-slate-400 mt-1">Twitter lead volume dropped by 42% compared to your 7-day average. This may indicate a campaign issue or platform outage.</p>
                    </div>
                    <button onClick={() => setAnomaly(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
            )}

            {/* NL Query */}
            <NLQueryBar stats={stats} />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard
                    title="Total Leads"
                    value={stats.totalLeads}
                    sub={`vs ${stats.totalLeadsLastMonth} last month`}
                    pct={pctChange(stats.totalLeads, stats.totalLeadsLastMonth)}
                    iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" color="bg-blue-500"
                />
                <KPICard
                    title="Qualified Leads"
                    value={stats.qualifiedLeads}
                    sub={`${Math.round((stats.qualifiedLeads / Math.max(stats.totalLeads, 1)) * 100)}% conversion rate`}
                    pct={pctChange(stats.qualifiedLeads, stats.qualifiedLeadsLastMonth)}
                    iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-emerald-500"
                />
                <KPICard
                    title="Avg. Response Time"
                    value={`${stats.avgResponseTimeHrs}h`}
                    sub="from creation to first contact"
                    iconPath="M13 10V3L4 14h7v7l9-11h-7z" color="bg-amber-500"
                />
                <KPICard
                    title="Closed Won"
                    value={stats.closedWon}
                    sub={`vs ${stats.closedWonLastMonth} last month`}
                    pct={pctChange(stats.closedWon, stats.closedWonLastMonth)}
                    iconPath="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color="bg-purple-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Leads Over Time — Line Chart */}
                <div className="xl:col-span-2 bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-5">Leads Over Time (30 Days)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={stats.leadsByDay} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <defs>
                                {Object.entries(SOURCE_COLORS).map(([src, color]) => (
                                    <linearGradient key={src} id={`grad_${src}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            {Object.entries(SOURCE_COLORS).map(([src, color]) => (
                                <Area key={src} type="monotone" dataKey={src} stroke={color} fill={`url(#grad_${src})`} strokeWidth={1.5} dot={false} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Leads by Source — Donut Chart */}
                <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Leads by Source</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie
                                data={stats.leadsBySource}
                                dataKey="count"
                                nameKey="source"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                            >
                                {stats.leadsBySource.map(entry => (
                                    <Cell key={entry.source} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {stats.leadsBySource.map(s => (
                            <div key={s.source} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                                    <span className="text-slate-400">{s.source}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">{s.count}</span>
                                    <span className="text-slate-600">{Math.round((s.count / stats.totalLeads) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Status Funnel */}
            <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-5">Lead Status Pipeline</h3>
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={stats.leadStatusFunnel} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 80 }}>
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="status" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                            {stats.leadStatusFunnel.map(entry => (
                                <Cell key={entry.status} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Team + Activity Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                    <TeamTable data={stats.teamPerformance} onDrillDown={onDrillDown} />
                </div>

                {/* Live Activity Feed */}
                <div className="bg-[#161b22] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Live Activity</h3>
                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> LIVE
                        </span>
                    </div>
                    <div className="space-y-0 max-h-80 overflow-y-auto pr-1">
                        {stats.recentActivity.slice(0, 12).map(act => (
                            <ActivityFeedItem key={act.id} description={act.description} timestamp={act.timestamp} userName={act.userName} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
