import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { useApp } from '@/contexts/AppContext';

export default function ReportsPage() {
  const { currentUser, reports } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const userReports = currentUser?.role === 'patient'
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;

  const filtered = userReports.filter(r =>
    (r.fileName.toLowerCase().includes(search.toLowerCase()) ||
      r.extractedData?.testName.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'all' || r.fileType === typeFilter)
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Reports Library</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} reports found</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All file types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div className="space-y-2">
          {filtered.map(r => <ReportCard key={r.id} report={r} />)}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-12 rounded-2xl border bg-card">No reports found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
