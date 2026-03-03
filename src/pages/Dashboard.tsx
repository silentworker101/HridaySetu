import { FileText, Upload, MessageCircle, Activity, Users, BarChart3, Heart, Cpu, ArrowRight, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { mockAnalytics, monthlyReportData, mockUsers } from '@/services/mockData';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { AiBadge } from '@/components/common/AiBadge';

export default function Dashboard() {
  const { currentUser, reports } = useApp();
  const navigate = useNavigate();

  const userReports = currentUser?.role === 'patient'
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;
  const recentReports = userReports.slice(0, 4);
  const flaggedReports = userReports.filter(r => (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0) > 0);
  const patientCount = mockUsers.filter(u => u.role === 'patient').length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <section className="rounded-3xl border bg-card/95 p-4 sm:p-6 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Welcome back, {currentUser?.name?.split(' ')[0]}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentUser?.role === 'patient' && 'Track report trends, understand AI explanations, and ask follow-up health questions.'}
                {currentUser?.role === 'doctor' && 'Review patient reports, investigate abnormal markers, and use AI for clinical summarization.'}
                {currentUser?.role === 'admin' && 'Monitor platform usage, AI operations, and system-level report analytics.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AiBadge />
              {currentUser?.role === 'patient' && (
                <Button onClick={() => navigate('/upload')} className="gradient-primary text-primary-foreground">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload New Report
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {currentUser?.role === 'patient' ? (
            <>
              <StatCard title="Total Reports" value={userReports.length} icon={FileText} variant="primary" />
              <StatCard title="AI Analyses" value={userReports.filter(r => r.status === 'completed').length} icon={Cpu} variant="success" />
              <StatCard title="Elevated / Critical" value={userReports.reduce((sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0), 0)} icon={Activity} variant="warning" />
              <StatCard title="Chat Sessions" value={1} icon={MessageCircle} />
            </>
          ) : currentUser?.role === 'doctor' ? (
            <>
              <StatCard title="Active Patients" value={patientCount} icon={Users} variant="primary" />
              <StatCard title="Reports Reviewed" value={mockAnalytics.totalReports} icon={FileText} />
              <StatCard title="AI Analyses" value={mockAnalytics.aiAnalyses} icon={Cpu} variant="success" />
              <StatCard title="Flagged Reports" value={flaggedReports.length} icon={AlertTriangle} variant="warning" />
            </>
          ) : (
            <>
              <StatCard title="Total Patients" value={mockAnalytics.totalPatients} icon={Users} variant="primary" />
              <StatCard title="Doctors" value={mockAnalytics.totalDoctors} icon={Heart} />
              <StatCard title="Reports" value={mockAnalytics.totalReports} icon={FileText} variant="success" />
              <StatCard title="This Month" value={mockAnalytics.reportsThisMonth} icon={BarChart3} trend="+15% vs last month" />
            </>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-semibold text-foreground">
                {currentUser?.role === 'doctor' ? 'Recent Clinical Reports' : 'Recent Reports'}
              </h3>
              <button onClick={() => navigate('/reports')} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {recentReports.map(r => <ReportCard key={r.id} report={r} />)}
              {recentReports.length === 0 && (
                <div className="bg-card border rounded-2xl p-8 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reports yet. Upload your first report to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Upload Trends</h4>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyReportData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">AI Insights Panel</h4>
                <AiBadge />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {currentUser?.role === 'patient' && '2 parameters need follow-up. Ask AI to compare your last two reports.'}
                {currentUser?.role === 'doctor' && '5 reports flagged for elevated markers this week. Prioritize diabetes and lipid follow-ups.'}
                {currentUser?.role === 'admin' && 'AI usage is steady with a 96% simulated processing success status.'}
              </p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/chat')}>
                Open AI Assistant
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
