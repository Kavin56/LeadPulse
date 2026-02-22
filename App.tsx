import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LeadListing } from './components/leads/LeadListing';
import { LeadDetail } from './components/leads/LeadDetail';
import { LeadManagement } from './components/management/LeadManagement';
import { Dashboard } from './components/dashboard/Dashboard';
import { UserRole, Lead } from './types';
import { startRealTimeSimulation, getLeads } from './services/dataService';

type Page = 'leads' | 'lead-detail' | 'dashboard' | 'management';

function App() {
  const [role, setRole] = useState<UserRole>('Sales Executive');
  const [activePage, setActivePage] = useState<Page>('leads');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [newLeadQueue, setNewLeadQueue] = useState<Lead[]>([]);

  // Determine landing page based on role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActivePage(newRole === 'Business Manager' ? 'dashboard' : 'leads');
  };

  // Handle real-time new leads
  useEffect(() => {
    const stop = startRealTimeSimulation((newLead) => {
      setNotificationCount(n => n + 1);
      setNewLeadQueue(q => [newLead, ...q].slice(0, 5));
    });
    // Stale alert count
    getLeads().then(leads => {
      setNotificationCount(leads.filter(l => l.isStale).length);
    });
    return stop;
  }, []);

  const navigate = (page: string) => {
    setActivePage(page as Page);
    if (page !== 'lead-detail') setSelectedLeadId(null);
  };

  const viewLead = (id: string) => {
    setSelectedLeadId(id);
    setActivePage('lead-detail');
  };

  const drillDownExec = (_execId: string) => {
    // Navigate to leads filtered by exec — for now go to leads
    setActivePage('leads');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-300 flex flex-col">
      <Navbar
        activePage={activePage}
        onNavigate={navigate}
        role={role}
        onRoleChange={handleRoleChange}
        notificationCount={notificationCount}
      />

      {/* New Lead Toast Notification */}
      {newLeadQueue.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
          {newLeadQueue.slice(0, 1).map(lead => (
            <div
              key={lead.id}
              className="flex items-start gap-3 p-4 bg-[#161b22] border border-emerald-500/25 rounded-xl shadow-2xl max-w-sm animate-[slideIn_0.3s_ease-out]"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-400 flex-shrink-0">
                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-emerald-400">New Lead Arrived</div>
                <div className="text-sm text-white">{lead.name}</div>
                <div className="text-xs text-slate-500">{lead.source} · Assigned to {lead.assignedToName}</div>
              </div>
              <button
                onClick={() => setNewLeadQueue(q => q.slice(1))}
                className="text-slate-600 hover:text-white transition-colors text-sm"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {activePage === 'leads' && (
          <LeadListing onViewLead={viewLead} />
        )}
        {activePage === 'lead-detail' && selectedLeadId && (
          <LeadDetail leadId={selectedLeadId} onBack={() => navigate('leads')} />
        )}
        {activePage === 'dashboard' && (
          <Dashboard onDrillDown={drillDownExec} />
        )}
        {activePage === 'management' && (
          <LeadManagement />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-4">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">L</span>
            </div>
            <span>LeadPulse by HSR Motors · Product Design Assignment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              All systems operational
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;