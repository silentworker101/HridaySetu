import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold text-foreground">
                {report.extractedData?.testName || report.fileName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {report.extractedData?.lab} • {report.extractedData?.date} • {report.userName}
              </p>
            </div>
            <Button onClick={() => navigate('/chat')} variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" /> Ask AI
            </Button>
          </div>
        </div>

        {/* AI Summary */}
        {report.aiSummary && (
          <div className="bg-accent border border-primary/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-accent-foreground mb-2">AI Summary</h3>
            <p className="text-sm text-foreground leading-relaxed">{report.aiSummary}</p>
          </div>
        )}

        {/* Parameters Table */}
        {report.extractedData && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold text-foreground">Test Parameters</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Parameter</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reference</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.extractedData.parameters.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-5 py-3 text-foreground">{p.value} {p.unit}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.referenceRange}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          p.status === 'normal' ? 'text-normal bg-normal/10' : 'text-abnormal bg-abnormal/10'
                        }`}>
                          {p.status === 'normal' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Explanation */}
        {report.aiExplanation && (
          <div className="bg-card border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Simple Explanation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.aiExplanation}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
