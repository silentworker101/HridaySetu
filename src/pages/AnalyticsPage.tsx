import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockAnalytics, monthlyReportData } from '@/services/mockData';
import { Users, FileText, Cpu, Activity, Heart, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AiBadge } from '@/components/common/AiBadge';

const pieData = [
  { name: 'CBC', value: 42 },
  { name: 'Lipid Panel', value: 28 },
  { name: 'Thyroid', value: 18 },
  { name: 'Diabetes', value: 35 },
  { name: 'Other', value: 33 },
];
const PIE_COLORS = ['hsl(174,62%,40%)', 'hsl(200,70%,50%)', 'hsl(38,92%,50%)', 'hsl(0,72%,55%)', 'hsl(200,20%,70%)'];

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Analytics</h1>
          <AiBadge />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Patients" value={mockAnalytics.totalPatients} icon={Users} variant="primary" />
          <StatCard title="Total Doctors" value={mockAnalytics.totalDoctors} icon={Heart} />
          <StatCard title="Total Reports" value={mockAnalytics.totalReports} icon={FileText} variant="success" />
          <StatCard title="AI Analyses" value={mockAnalytics.aiAnalyses} icon={Cpu} />
          <StatCard title="Active Chats" value={mockAnalytics.activeChats} icon={MessageCircle} />
          <StatCard title="This Month" value={mockAnalytics.reportsThisMonth} icon={Activity} variant="warning" trend="+15%" />
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
