import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AiBadge } from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';

const trendData = [
  { date: 'Jan', hemoglobin: 13.8, wbc: 9000, glucose: 95 },
  { date: 'Feb', hemoglobin: 14.2, wbc: 11500, glucose: 105 },
];

const recommendations = [
  'Increase dietary fiber intake to help manage cholesterol levels',
  'Schedule a follow-up WBC test in 4-6 weeks',
  'Consider regular cardiovascular exercise (30 min, 5x/week)',
  'Maintain a balanced diet with reduced saturated fats',
];

export default function InsightsPage() {
  const { reports, currentUser } = useApp();
  const userReports = reports.filter(r => r.userId === currentUser?.id && r.status === 'completed');
  const totalAbnormal = userReports.reduce((sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0), 0);
  const totalNormal = userReports.reduce((sum, r) => sum + (r.extractedData?.parameters.filter(p => p.status === 'normal').length || 0), 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-display font-bold text-foreground">AI Analysis & Health Insights</h1>
          <div className="flex items-center gap-2">
            <AiBadge />
            <Badge variant="outline">Confidence: 86%</Badge>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-normal/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-normal" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{totalNormal}</p>
              <p className="text-sm text-muted-foreground">Normal Parameters</p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-abnormal/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-abnormal" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{totalAbnormal}</p>
              <p className="text-sm text-muted-foreground">Abnormal Parameters</p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{userReports.length}</p>
              <p className="text-sm text-muted-foreground">Reports Analyzed</p>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-card border rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Parameter Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="hemoglobin" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Hemoglobin (g/dL)" />
              <Line type="monotone" dataKey="glucose" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} name="Glucose (mg/dL)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations */}
        <div className="bg-card border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
