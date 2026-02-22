import React from 'react';
import { UserRole } from '../../types';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    role: UserRole;
    onRoleChange: (role: UserRole) => void;
    notificationCount: number;
}

const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div>
            <div className="text-white font-bold text-lg leading-none tracking-tight">LeadPulse</div>
            <div className="text-[10px] text-slate-400 leading-tight tracking-wide">HSR Motors</div>
        </div>
    </div>
);

const NAV_ITEMS: { id: string; label: string; iconPath: string }[] = [
    {
        id: 'leads', label: 'Leads',
        iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
        id: 'dashboard', label: 'Dashboard',
        iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
        id: 'management', label: 'Management',
        iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
];

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, role, onRoleChange, notificationCount }) => {
    return (
        <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="max-w-[1600px] mx-auto px-6 h-15 flex items-center justify-between gap-6" style={{ height: '60px' }}>

                {/* Logo */}
                <Logo />

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === item.id || (activePage === 'lead-detail' && item.id === 'leads')
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                    {/* Live Indicator */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">Live</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Role Switcher */}
                    <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg p-0.5">
                        {(['Sales Executive', 'Business Manager'] as UserRole[]).map(r => (
                            <button
                                key={r}
                                onClick={() => onRoleChange(r)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap ${role === r
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {r === 'Sales Executive' ? 'Sales' : 'Manager'}
                            </button>
                        ))}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                        {role === 'Sales Executive' ? 'RS' : 'BM'}
                    </div>
                </div>
            </div>
        </header>
    );
};
