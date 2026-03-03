import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { mockReports } from '@/services/mockData';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = mockReports.filter(r => {
    const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.extractedData?.testName.toLowerCase().includes(search.toLowerCase()) ||
      r.fileName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || r.extractedData?.testName.toLowerCase().includes(typeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Advanced Search</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient, test name, or file..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="relative sm:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border bg-card pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="blood">CBC</option>
              <option value="lipid">Lipid</option>
              <option value="thyroid">Thyroid</option>
              <option value="diabetes">Diabetes</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(r => <ReportCard key={r.id} report={r} />)}
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm text-muted-foreground">No results found.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
