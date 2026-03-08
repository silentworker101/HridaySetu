import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb, BarChart2, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// A palette of distinct colors for dynamic trend lines
const LINE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(32 80% 60%)',
  'hsl(270 60% 60%)',
];

export default function InsightsPage() {
  const { reports, currentUser, chatSessions } = useApp();
  const navigate = useNavigate();

  const userReports = reports.filter(r => r.userId === currentUser?.id && r.status === 'completed');
  const totalAbnormal = userReports.reduce(
    (sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0), 0,
  );
  const totalNormal = userReports.reduce(
    (sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status === 'normal').length || 0), 0,
  );

  // ── Dynamic trend chart ──────────────────────────────────────
  // Collect all parameter names across all reports to find those that repeat.
  const paramFrequency = new Map<string, number>();
  userReports.forEach(r => {
    const seen = new Set<string>();
    r.extractedData?.parameters.forEach(p => {
      const key = p.name.toLowerCase();
      if (!seen.has(key)) {
        paramFrequency.set(key, (paramFrequency.get(key) || 0) + 1);
        seen.add(key);
      }
    });
  });

  // Pick up to 3 parameters that appear in the most reports (prefer tracked ones)
  const topTracked = Array.from(paramFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  const sortedReports = [...userReports].sort((a, b) => {
    const aDate = new Date(a.extractedData?.date || a.uploadedAt).getTime();
    const bDate = new Date(b.extractedData?.date || b.uploadedAt).getTime();
    return aDate - bDate;
  });

  // Build trend data: one row per report, one key per tracked parameter
  const trendData = sortedReports.map(report => {
    const extracted = report.extractedData;
    const labelDate = new Date(extracted?.date || report.uploadedAt);
    const dateLabel = Number.isNaN(labelDate.getTime())
      ? (extracted?.date || report.uploadedAt)
      : labelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const row: Record<string, string | number> = { date: dateLabel };
    topTracked.forEach(key => {
      const param = extracted?.parameters.find(p => p.name.toLowerCase() === key);
      if (param) {
        const num = Number(param.value);
        if (!Number.isNaN(num)) row[key] = num;
      }
    });
    return row;
  });

  // Canonical display names for tracked params (title-case the key)
  const paramDisplayName = (key: string) =>
    key.replace(/\b\w/g, c => c.toUpperCase());

  const hasLineData = trendData.some(d => topTracked.some(k => k in d));

  // ── Normal vs Abnormal per report (fallback / companion bar chart) ──
  const perReportData = sortedReports.map(report => {
    const params = report.extractedData?.parameters || [];
    const labelDate = new Date(report.extractedData?.date || report.uploadedAt);
    const dateLabel = Number.isNaN(labelDate.getTime())
      ? (report.extractedData?.date || 'Unknown')
      : labelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return {
      date: dateLabel,
      normal: params.filter(p => p.status === 'normal').length,
      abnormal: params.filter(p => p.status !== 'normal').length,
    };
  });

  // ── Abnormal parameter breakdown ──────────────────────────────
  const abnormalCounts = new Map<string, number>();
  userReports.forEach(report => {
    report.extractedData?.parameters.forEach(param => {
      if (param.status !== 'normal') {
        abnormalCounts.set(param.name, (abnormalCounts.get(param.name) || 0) + 1);
      }
    });
  });
  const topAbnormalParameters = Array.from(abnormalCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxAbnormalCount = topAbnormalParameters[0]?.[1] || 1;

  // ── Recommendations ───────────────────────────────────────────
  const reportsWithoutChats = userReports.filter(
    report => !chatSessions.some(session => session.reportId === report.id),
  ).length;

  const recommendations: string[] =
    topAbnormalParameters.length > 0
      ? topAbnormalParameters.map(
          ([name, count]) =>
            `Parameter "${name}" was flagged in ${count} of your recent reports. Consider discussing this trend and possible next steps with your clinician.`,
        )
      : [
          'Your recent lab parameters are mostly within the normal range. Continue your current health habits and follow routine checkups as advised.',
        ];

  if (reportsWithoutChats > 0) {
    recommendations.unshift(
      `${reportsWithoutChats} report${reportsWithoutChats > 1 ? 's have' : ' has'} abnormal markers without any follow-up questions yet. Open the AI chat to clarify what these results mean for you.`,
    );
  }

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '10px',
    fontSize: '12px',
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">AI Analysis &amp; Health Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Trends and recommendations based on your reports.</p>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-success/8 to-card border border-success/20 rounded-2xl p-5 flex items-start gap-3 shadow-card">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{totalNormal}</p>
              <p className="text-sm text-muted-foreground">Normal Parameters</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-abnormal/8 to-card border border-abnormal/20 rounded-2xl p-5 flex items-start gap-3 shadow-card">
            <div className="h-10 w-10 rounded-xl bg-abnormal/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-abnormal" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{totalAbnormal}</p>
              <p className="text-sm text-muted-foreground">Abnormal Parameters</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/8 to-card border border-primary/20 rounded-2xl p-5 flex items-start gap-3 shadow-card">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{userReports.length}</p>
              <p className="text-sm text-muted-foreground">Reports Analyzed</p>
            </div>
          </div>
        </div>

        {/* Parameter trends */}
        <div className="bg-card border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Parameter Trends</h3>
            {topTracked.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">— top {topTracked.length} repeated parameters</span>
            )}
          </div>

          {hasLineData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                {topTracked.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={paramDisplayName(key)}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No repeated parameters found across reports yet.</p>
              <p className="text-xs text-muted-foreground/70">Upload more reports to see trends.</p>
            </div>
          )}
        </div>

        {/* Normal vs Abnormal per report */}
        {perReportData.length > 0 && (
          <div className="bg-card border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Normal vs Abnormal per Report</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perReportData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="normal" name="Normal" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="abnormal" name="Abnormal" fill="hsl(var(--abnormal))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Abnormal parameter breakdown */}
        {topAbnormalParameters.length > 0 && (
          <div className="bg-card border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">Abnormal Parameter Breakdown</h3>
            </div>
            <div className="space-y-3">
              {topAbnormalParameters.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-40 sm:w-52 shrink-0 truncate">{name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-abnormal/70 transition-all duration-500"
                      style={{ width: `${(count / maxAbnormalCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                    {count} report{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-card border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
            </div>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary gap-1.5"
            onClick={() => navigate('/chat')}
          >
            Ask AI about my results
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
