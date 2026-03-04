import { FileText, Upload, MessageCircle, Activity, Users, BarChart3, Heart, Cpu, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { AiBadge } from '@/components/common/AiBadge';

export default function Dashboard() {
  const { currentUser, reports, chatSessions } = useApp();
  const navigate = useNavigate();

  const userReports = currentUser?.role === 'patient'
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;
  const recentReports = userReports.slice(0, 4);
  const flaggedReports = userReports.filter(r => (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0) > 0);
  const uniquePatientIds = new Set(reports.map(r => r.userId));
  const patientCount = uniquePatientIds.size;

  const completedReports = reports.filter(r => r.status === 'completed');

  const now = new Date();
  const reportsThisMonth = reports.filter(r => {
    const uploaded = new Date(r.uploadedAt);
    if (Number.isNaN(uploaded.getTime())) return false;
    return uploaded.getMonth() === now.getMonth() && uploaded.getFullYear() === now.getFullYear();
  }).length;

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
          entry = { key, month: date.toLocaleString(undefined, { month: 'short' }), reports: 0 };
          acc.push(entry);
        }
        entry.reports += 1;
        return acc;
      },
      [] as { key: string; month: string; reports: number }[],
    )
    .sort((a, b) => a.key.localeCompare(b.key));

  const userChatSessions =
    currentUser?.role === 'patient'
      ? chatSessions.filter(session =>
          session.reportId &&
          reports.some(r => r.id === session.reportId && r.userId === currentUser.id),
        )
      : chatSessions;

  const abnormalParametersThisMonth = completedReports.flatMap(report => {
    const extracted = report.extractedData;
    if (!extracted) return [];
    const date = new Date(extracted.date);
    if (Number.isNaN(date.getTime())) return [];
    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return [];
    return extracted.parameters.filter(p => p.status !== 'normal').map(p => p.name);
  });

  const abnormalFrequency = abnormalParametersThisMonth.reduce<Record<string, number>>((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const topAbnormalMarkers = Object.entries(abnormalFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  void topAbnormalMarkers;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">

        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/8 via-accent/60 to-card p-5 sm:p-6 shadow-card">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AiBadge />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Welcome back, {currentUser?.name?.split(' ')[0]}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {currentUser?.role === 'patient' && 'Track report trends, understand AI explanations, and ask follow-up health questions.'}
                {currentUser?.role === 'doctor' && 'Review patient reports, investigate abnormal markers, and use AI for clinical summarization.'}
                {currentUser?.role === 'admin' && 'Monitor platform usage, AI operations, and system-level report analytics.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {currentUser?.role === 'patient' && (
                <Button onClick={() => navigate('/upload')} className="gradient-primary text-primary-foreground shadow-card">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload Report
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/chat')} className="border-primary/20 hover:bg-primary/5">
                <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
                AI Assistant
              </Button>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {currentUser?.role === 'patient' ? (
            <>
              <StatCard title="Total Reports" value={userReports.length} icon={FileText} variant="primary" />
              <StatCard title="AI Analyses" value={userReports.filter(r => r.status === 'completed').length} icon={Cpu} variant="success" />
              <StatCard title="Elevated / Critical" value={userReports.reduce((sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0), 0)} icon={Activity} variant="warning" />
              <StatCard title="Chat Sessions" value={userChatSessions.length} icon={MessageCircle} />
            </>
          ) : currentUser?.role === 'doctor' ? (
            <>
              <StatCard title="Active Patients" value={patientCount} icon={Users} variant="primary" />
              <StatCard title="Reports Reviewed" value={userReports.length} icon={FileText} />
              <StatCard title="AI Analyses" value={completedReports.length} icon={Cpu} variant="success" />
              <StatCard title="Flagged Reports" value={flaggedReports.length} icon={AlertTriangle} variant="warning" />
            </>
          ) : (
            <>
              <StatCard title="Total Patients" value={patientCount} icon={Users} variant="primary" />
              <StatCard title="Doctors" value={doctorNames.size} icon={Heart} />
              <StatCard title="Reports" value={reports.length} icon={FileText} variant="success" />
              <StatCard title="This Month" value={reportsThisMonth} icon={BarChart3} />
            </>
          )}
        </section>

        {/* Main content */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-foreground">
                {currentUser?.role === 'doctor' ? 'Recent Clinical Reports' : 'Recent Reports'}
              </h3>
              <button
                onClick={() => navigate('/reports')}
                className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium hover:underline underline-offset-2"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {recentReports.map(r => <ReportCard key={r.id} report={r} />)}
              {recentReports.length === 0 && (
                <div className="bg-card border rounded-2xl p-10 text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No reports yet</p>
                  <p className="text-xs text-muted-foreground">Upload your first report to get started.</p>
                  {currentUser?.role === 'patient' && (
                    <Button size="sm" className="mt-4 gradient-primary text-primary-foreground" onClick={() => navigate('/upload')}>
                      Upload Report
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            {/* Upload trends chart */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Upload Trends</h4>
              {monthlyReportData.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={monthlyReportData} barSize={20}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} width={24} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: 'var(--shadow-card)',
                      }}
                      cursor={{ fill: 'hsl(var(--accent))' }}
                    />
                    <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[190px] flex items-center justify-center text-xs text-muted-foreground">
                  No upload data yet
                </div>
              )}
            </div>

            {/* AI Insights Panel */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">AI Insights Panel</h4>
                <AiBadge />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentUser?.role === 'patient' && '2 parameters need follow-up. Ask AI to compare your last two reports.'}
                {currentUser?.role === 'doctor' && '5 reports flagged for elevated markers this week. Prioritize diabetes and lipid follow-ups.'}
                {currentUser?.role === 'admin' && 'AI usage is steady with a 96% simulated processing success status.'}
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary" onClick={() => navigate('/chat')}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Open AI Assistant
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
