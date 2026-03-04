import { useState } from 'react';
import { Search, FileText, ChevronRight, Clock3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockUsers, mockReports } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const patients = mockUsers.filter(u => u.role === 'patient');
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Patient Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Structured report history and AI-assisted triage</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(patient => {
            const patientReports = mockReports.filter(r => r.userId === patient.id);
            return (
              <div
                key={patient.id}
                onClick={() => navigate(`/reports`)}
                className="bg-card border rounded-2xl p-4 flex items-center gap-4 hover:shadow-elevated transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {patient.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patientReports.length} reports</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{patientReports.filter(r => r.status === 'completed').length} analyzed</span>
                  <Clock3 className="h-4 w-4" />
                  <span className="text-sm">Latest: {patientReports[0] ? new Date(patientReports[0].uploadedAt).toLocaleDateString() : '-'}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground sm:hidden" />
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
