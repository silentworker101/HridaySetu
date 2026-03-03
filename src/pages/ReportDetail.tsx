import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MessageCircle, RotateCcw, BookOpen, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { AiBadge } from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports } = useApp();
  const report = reports.find(r => r.id === id);

  if (!report) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Report not found.</p>
          <Button variant="outline" onClick={() => navigate('/reports')} className="mt-4">Back to Reports</Button>
        </div>
      </AppLayout>
    );
  }

  const abnormalCount = report.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0;
  const statusTone = abnormalCount > 0 ? 'elevated' : 'normal';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto animate-fade-in space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <section className="bg-card border rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-foreground">
                {report.extractedData?.testName || report.fileName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {report.extractedData?.lab} | {report.extractedData?.date} | {report.userName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={statusTone} />
                <Badge variant="outline">{abnormalCount} flagged markers</Badge>
                <AiBadge />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/chat')} variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" /> Ask AI
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Regenerate
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-card border rounded-2xl overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-foreground">Structured Extraction</h3>
            </div>
            {report.extractedData ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[620px]">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parameter</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reference Range</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.extractedData.parameters.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-foreground">{p.value} {p.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.referenceRange}</td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={p.status === 'abnormal' ? 'elevated' : p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-sm text-muted-foreground">No extracted data available.</div>
            )}
          </div>

          <aside className="xl:col-span-4 space-y-4">
            <div className="bg-card border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
                <AiBadge />
              </div>
              <p className="text-sm text-foreground mt-3 leading-relaxed">{report.aiSummary || 'AI summary is being generated.'}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Confidence: 87% (simulated)
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Simplified Explanation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.aiExplanation || 'Plain-language explanation unavailable.'}</p>
            </div>

            <div className="bg-card border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Data Sources</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>Uploaded report image/PDF text extraction</li>
                <li>Reference range interpretation rules</li>
                <li>Context-aware AI reasoning template</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
}
