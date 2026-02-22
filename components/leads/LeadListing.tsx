import React, { useState, useEffect, useCallback } from 'react';
import {
    Lead, LeadSource, LeadStatus, CarInterest,
} from '../../types';
import {
    getLeads, addLead, updateLead, getRelativeTime,
    getStatusColor, getSourceIcon, SOURCE_CONFIG, SALES_EXECUTIVES,
} from '../../services/dataService';

interface LeadListingProps {
    onViewLead: (leadId: string) => void;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Not Interested', 'Closed Won', 'Closed Lost'];
const SOURCES: LeadSource[] = ['Facebook', 'Google', 'Twitter', 'Website', 'Offline'];
const CAR_TYPES: CarInterest[] = ['SUV', 'Sedan', 'Hatchback', 'EV', 'Luxury', 'MUV'];

const StatusPill: React.FC<{ status: LeadStatus }> = ({ status }) => {
    const cl = getStatusColor(status);
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cl.bg} ${cl.text} ${cl.border}`}>
            {status}
        </span>
    );
};

const SourceBadge: React.FC<{ source: LeadSource }> = ({ source }) => (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-white/10 text-slate-300">{getSourceIcon(source)}</span>
        <span className="text-slate-400 text-xs">{source}</span>
    </span>
);

type SortField = 'name' | 'source' | 'status' | 'lastActivity' | 'carInterest';

const PAGE_SIZE = 25;

export const LeadListing: React.FC<LeadListingProps> = ({ onViewLead }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filterSource, setFilterSource] = useState<LeadSource | 'All'>('All');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'All'>('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<SortField>('lastActivity');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());
    const [bulkAction, setBulkAction] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadLeads = useCallback(async () => {
        const data = await getLeads();
        setLeads(data);
        setLastSync(new Date());
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadLeads();
        const interval = setInterval(loadLeads, 60000);
        return () => clearInterval(interval);
    }, [loadLeads]);

    // Filtering
    const filtered = leads.filter(l => {
        if (filterSource !== 'All' && l.source !== filterSource) return false;
        if (filterStatus !== 'All' && l.status !== filterStatus) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
        }
        return true;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
        let aVal: string = '', bVal: string = '';
        if (sortField === 'lastActivity') { aVal = a.lastActivity; bVal = b.lastActivity; }
        else if (sortField === 'name') { aVal = a.name; bVal = b.name; }
        else if (sortField === 'source') { aVal = a.source; bVal = b.source; }
        else if (sortField === 'status') { aVal = a.status; bVal = b.status; }
        else if (sortField === 'carInterest') { aVal = a.carInterest; bVal = b.carInterest; }
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const staleLedCount = leads.filter(l => l.isStale).length;

    const toggleSort = (field: SortField) => {
        if (sortField === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
        else { setSortField(field); setSortDir('desc'); }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === paginated.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginated.map(l => l.id)));
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;
        if (bulkAction.startsWith('status:')) {
            const newStatus = bulkAction.replace('status:', '') as LeadStatus;
            await Promise.all([...selectedIds].map(id => updateLead(id, { status: newStatus })));
        } else if (bulkAction.startsWith('assign:')) {
            const execId = bulkAction.replace('assign:', '');
            const exec = SALES_EXECUTIVES.find(e => e.id === execId);
            if (exec) {
                await Promise.all([...selectedIds].map(id => updateLead(id, { assignedTo: exec.id, assignedToName: exec.name })));
            }
        } else if (bulkAction === 'export') {
            const csvLeads = leads.filter(l => selectedIds.has(l.id));
            const rows = [
                ['Name', 'Phone', 'Email', 'Source', 'Car Interest', 'Status', 'Assigned To', 'Created At'].join(','),
                ...csvLeads.map(l =>
                    [`"${l.name}"`, `"${l.phone}"`, `"${l.email}"`, l.source, l.carInterest, l.status, `"${l.assignedToName}"`, l.createdAt].join(',')
                ),
            ].join('\n');
            const blob = new Blob([rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
        }
        setSelectedIds(new Set());
        setBulkAction('');
        loadLeads();
    };

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className={`ml-1 text-[10px] ${sortField === field ? 'text-indigo-400' : 'text-slate-600'}`}>
            {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    return (
        <div className="p-6 space-y-5 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">All Leads</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {filtered.length} leads · Last synced {getRelativeTime(lastSync.toISOString())}
                        <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {staleLedCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-xs font-semibold">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {staleLedCount} Stale Lead{staleLedCount > 1 ? 's' : ''} (2hr SLA)
                        </div>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-indigo-500/20"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#161b22] border border-white/[0.07] rounded-xl p-4 flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                </div>

                {/* Source filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {(['All', ...SOURCES] as (LeadSource | 'All')[]).map(s => (
                        <button
                            key={s}
                            onClick={() => { setFilterSource(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterSource === s
                                ? 'bg-indigo-500 text-white'
                                : 'bg-[#0d1117] text-slate-400 hover:text-white border border-white/[0.06]'
                                }`}
                        >
                            {s !== 'All' && getSourceIcon(s as LeadSource)} {s}
                        </button>
                    ))}
                </div>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value as LeadStatus | 'All'); setPage(1); }}
                    className="px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
                    <span className="text-indigo-300 text-sm font-semibold">{selectedIds.size} selected</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={bulkAction}
                            onChange={e => setBulkAction(e.target.value)}
                            className="px-3 py-1.5 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-slate-300 focus:outline-none"
                        >
                            <option value="">Choose action…</option>
                            <optgroup label="Change Status">
                                {STATUSES.map(s => <option key={s} value={`status:${s}`}>→ {s}</option>)}
                            </optgroup>
                            <optgroup label="Reassign To">
                                {SALES_EXECUTIVES.map(e => <option key={e.id} value={`assign:${e.id}`}>→ {e.name}</option>)}
                            </optgroup>
                            <option value="export">Export CSV</option>
                        </select>
                        <button
                            onClick={handleBulkAction}
                            disabled={!bulkAction}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-[#161b22] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/[0.07] bg-[#0d1117]/50">
                                <th className="p-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === paginated.length && paginated.length > 0}
                                        onChange={selectAll}
                                        className="w-4 h-4 accent-indigo-500"
                                    />
                                </th>
                                {[
                                    { label: 'Lead Name', field: 'name' as SortField },
                                    { label: 'Phone', field: null },
                                    { label: 'Source', field: 'source' as SortField },
                                    { label: 'Car Interest', field: 'carInterest' as SortField },
                                    { label: 'Assigned To', field: null },
                                    { label: 'Status', field: 'status' as SortField },
                                    { label: 'Last Activity', field: 'lastActivity' as SortField },
                                    { label: 'Actions', field: null },
                                ].map(col => (
                                    <th
                                        key={col.label}
                                        onClick={() => col.field && toggleSort(col.field)}
                                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.field ? 'cursor-pointer hover:text-slate-300' : ''}`}
                                    >
                                        {col.label}
                                        {col.field && <SortIcon field={col.field} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {paginated.map(lead => (
                                <tr
                                    key={lead.id}
                                    className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(lead.id) ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(lead.id)}
                                            onChange={() => toggleSelect(lead.id)}
                                            onClick={e => e.stopPropagation()}
                                            className="w-4 h-4 accent-indigo-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                                                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-medium text-white">{lead.name}</span>
                                                    {lead.isStale && (
                                                        <span title="Stale lead — no contact for 2+ hours" className="flex items-center text-red-400 animate-pulse">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{lead.phone}</td>
                                    <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-slate-200">{lead.carModel}</div>
                                        <div className="text-xs text-slate-500">{lead.carInterest}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300 flex-shrink-0">
                                                {lead.assignedToName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm text-slate-300">{lead.assignedToName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><StatusPill status={lead.status} /></td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{getRelativeTime(lead.lastActivity)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`tel:${lead.phone}`}
                                                onClick={e => e.stopPropagation()}
                                                className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                                                title="Quick Call"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={() => onViewLead(lead.id)}
                                                className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center">
                                        <div className="text-slate-500 text-sm">No leads match your filters.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-white/[0.07] px-6 py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                        Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} leads
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/[0.06] text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            ← Prev
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-7 rounded-lg text-xs transition-colors ${page === p ? 'bg-indigo-600 text-white' : 'bg-[#0d1117] border border-white/[0.06] text-slate-400 hover:text-white'}`}>
                                    {p}
                                </button>
                            );
                        })}
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/[0.06] text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Lead Modal */}
            {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onAdd={async (data) => { await addLead(data); await loadLeads(); setShowAddModal(false); }} />}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
// Add Lead Modal
// ──────────────────────────────────────────────────────────────
interface AddLeadModalProps {
    onClose: () => void;
    onAdd: (data: Partial<Lead>) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'Offline' as LeadSource, carInterest: 'SUV' as CarInterest, budget: '', campaignName: '' });
    const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    const handle = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-[#161b22] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">Add New Lead</h3>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors">✕</button>
                </div>
                <form onSubmit={handle} className="space-y-4">
                    {([['name', 'Name *', ' '], ['phone', 'Phone *', ' '], ['email', 'Email', ''], ['campaignName', 'Campaign Name (optional)', '']] as [keyof typeof form, string, string][]).map(([k, l]) => (
                        <div key={k}>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">{l}</label>
                            <input required={l.includes('*')} value={form[k]} onChange={field(k)} type="text"
                                className="w-full px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Source</label>
                            <select value={form.source} onChange={field('source')} className="w-full px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                                {SOURCES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Car Interest</label>
                            <select value={form.carInterest} onChange={field('carInterest')} className="w-full px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                                {CAR_TYPES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Budget Range</label>
                        <select value={form.budget} onChange={field('budget')} className="w-full px-3 py-2 bg-[#0d1117] border border-white/[0.07] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                            {['₹5L – ₹8L', '₹8L – ₹12L', '₹12L – ₹18L', '₹18L – ₹25L', '₹25L – ₹40L', '₹40L – ₹60L', '₹60L+'].map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-white/[0.07]">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">Add Lead</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
