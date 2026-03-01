import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { useApp } from '@/contexts/AppContext';

export default function ReportsPage() {
  const { currentUser, reports } = useApp();
  const [search, setSearch] = useState('');

  const userReports = currentUser?.role === 'patient'
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;

  const filtered = userReports.filter(r =>
    r.fileName.toLowerCase().includes(search.toLowerCase()) ||
    r.extractedData?.testName.toLowerCase().includes(search.toLowerCase()) ||
    r.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(r => <ReportCard key={r.id} report={r} />)}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No reports found.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
