import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileText, Cpu, Activity, Heart, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AiBadge } from '@/components/common/AiBadge';
import { useApp } from '@/contexts/AppContext';

const PIE_COLORS = ['hsl(174,62%,40%)', 'hsl(200,70%,50%)', 'hsl(38,92%,50%)', 'hsl(0,72%,55%)', 'hsl(200,20%,70%)'];

export default function AnalyticsPage() {
  const { reports, chatSessions } = useApp();

  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed');
  const aiAnalyses = completedReports.length;

  const now = new Date();
  const reportsThisMonth = reports.filter(r => {
    const uploaded = new Date(r.uploadedAt);
    if (Number.isNaN(uploaded.getTime())) return false;
    return uploaded.getMonth() === now.getMonth() && uploaded.getFullYear() === now.getFullYear();
  }).length;

  const uniquePatientIds = new Set(reports.map(r => r.userId));
  const totalPatients = uniquePatientIds.size;

  const doctorNames = new Set(
    reports
      .map(r => r.extractedData?.doctor)
      .filter((d): d is string => Boolean(d)),
  );

  const monthlyReportData = reports
    .reduce(
      (acc, report) => {
        const date = new Date(report.uploadedAt);
        if (Number.isNaN(date.getTime())) return acc;

        const key = `${date.getFullYear()}-${date.getMonth()}`;
        let entry = acc.find(e => e.key === key);
        if (!entry) {
          entry = {
            key,
            month: date.toLocaleString(undefined, { month: 'short' }),
            reports: 0,
          };
          acc.push(entry);
        }
        entry.reports += 1;
        return acc;
      },
      [] as { key: string; month: string; reports: number }[],
    )
    .sort((a, b) => a.key.localeCompare(b.key));

  const pieData = [
    {
      name: 'CBC',
      value: reports.filter(r => r.extractedData?.testName.toLowerCase().includes('complete blood count') || r.extractedData?.testName.toLowerCase().includes('cbc')).length,
    },
    {
      name: 'Lipid Panel',
      value: reports.filter(r => r.extractedData?.testName.toLowerCase().includes('lipid')).length,
    },
    {
      name: 'Thyroid',
      value: reports.filter(r => r.extractedData?.testName.toLowerCase().includes('thyroid')).length,
    },
    {
      name: 'Diabetes',
      value: reports.filter(r => r.extractedData?.testName.toLowerCase().includes('diabetes') || r.extractedData?.testName.toLowerCase().includes('glucose')).length,
    },
    {
      name: 'Other',
      value: reports.filter(r => {
        const name = r.extractedData?.testName.toLowerCase() || '';
        return (
          name &&
          !name.includes('complete blood count') &&
          !name.includes('cbc') &&
          !name.includes('lipid') &&
          !name.includes('thyroid') &&
          !name.includes('diabetes') &&
          !name.includes('glucose')
        );
      }).length,
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Analytics</h1>
          <AiBadge />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Patients" value={totalPatients} icon={Users} variant="primary" />
          <StatCard title="Total Doctors" value={doctorNames.size} icon={Heart} />
          <StatCard title="Total Reports" value={totalReports} icon={FileText} variant="success" />
          <StatCard title="AI Analyses" value={aiAnalyses} icon={Cpu} />
          <StatCard title="Active Chats" value={chatSessions.length} icon={MessageCircle} />
          <StatCard title="This Month" value={reportsThisMonth} icon={Activity} variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Reports</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyReportData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Reports by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
