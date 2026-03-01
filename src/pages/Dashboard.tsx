import { FileText, Upload, MessageCircle, Activity, Users, BarChart3, Heart, Cpu } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { mockAnalytics, monthlyReportData } from '@/services/mockData';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { currentUser, reports } = useApp();
  const navigate = useNavigate();

  const userReports = currentUser?.role === 'patient'
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;

  const recentReports = userReports.slice(0, 4);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === 'patient' && 'Here\'s an overview of your health reports and AI insights.'}
            {currentUser?.role === 'doctor' && 'Manage your patients and review AI-powered report analyses.'}
            {currentUser?.role === 'admin' && 'System overview and analytics dashboard.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentUser?.role === 'patient' ? (
            <>
              <StatCard title="Total Reports" value={userReports.length} icon={FileText} variant="primary" />
              <StatCard title="AI Analyses" value={userReports.filter(r => r.status === 'completed').length} icon={Cpu} variant="success" />
              <StatCard title="Abnormalities" value={userReports.reduce((sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0), 0)} icon={Activity} variant="warning" />
              <StatCard title="Chat Sessions" value={1} icon={MessageCircle} />
            </>
          ) : currentUser?.role === 'doctor' ? (
            <>
              <StatCard title="Patients" value={mockAnalytics.totalPatients} icon={Users} variant="primary" />
              <StatCard title="Reports" value={mockAnalytics.totalReports} icon={FileText} />
              <StatCard title="AI Analyses" value={mockAnalytics.aiAnalyses} icon={Cpu} variant="success" />
              <StatCard title="Active Chats" value={mockAnalytics.activeChats} icon={MessageCircle} />
            </>
          ) : (
            <>
              <StatCard title="Total Patients" value={mockAnalytics.totalPatients} icon={Users} variant="primary" />
              <StatCard title="Doctors" value={mockAnalytics.totalDoctors} icon={Heart} />
              <StatCard title="Reports" value={mockAnalytics.totalReports} icon={FileText} variant="success" />
              <StatCard title="This Month" value={mockAnalytics.reportsThisMonth} icon={BarChart3} trend="+15% vs last month" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-foreground">Recent Reports</h2>
              <button onClick={() => navigate('/reports')} className="text-sm text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-2">
              {recentReports.map(r => <ReportCard key={r.id} report={r} />)}
              {recentReports.length === 0 && (
                <div className="bg-card border rounded-xl p-8 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reports yet. Upload your first report to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Reports Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyReportData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
