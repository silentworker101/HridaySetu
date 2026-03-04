import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MessageCircle, RotateCcw, BookOpen, Info, FileImage, Loader2, ChevronRight, Maximize2, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { AiBadge } from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { reasoningService } from '@/services/aiService';

// ─── Report Text Renderer ────────────────────────────────────────────────────
// Parses AI-generated plain text into structured, visually formatted sections.
// Handles: numbered sections (1. ...), bullet sub-items (- ...), plain paragraphs.
// Zero hardcoded content — purely a formatting layer on top of whatever the AI returns.

type LineType = 'numbered' | 'bullet' | 'paragraph' | 'empty';

interface ParsedLine {
  type: LineType;
  raw: string;
  label?: string;
  body?: string;
  sectionNumber?: string;
}

function classifyLine(line: string): ParsedLine {
  const trimmed = line.trim();

  if (!trimmed) return { type: 'empty', raw: line };

  const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
  if (numberedMatch) {
    const rest = numberedMatch[2];
    const colonIdx = rest.indexOf(':');
    if (colonIdx !== -1) {
      return {
        type: 'numbered',
        raw: line,
        sectionNumber: numberedMatch[1],
        label: rest.slice(0, colonIdx).trim(),
        body: rest.slice(colonIdx + 1).trim(),
      };
    }
    return {
      type: 'numbered',
      raw: line,
      sectionNumber: numberedMatch[1],
      label: rest,
      body: '',
    };
  }

  const bulletMatch = trimmed.match(/^[-–•]\s+(.+)/);
  if (bulletMatch) {
    const rest = bulletMatch[1];
    const colonIdx = rest.indexOf(':');
    if (colonIdx !== -1) {
      return {
        type: 'bullet',
        raw: line,
        label: rest.slice(0, colonIdx).trim(),
        body: rest.slice(colonIdx + 1).trim(),
      };
    }
    return { type: 'bullet', raw: line, body: rest };
  }

  return { type: 'paragraph', raw: line, body: trimmed };
}

function ReportTextRenderer({ text, fallback = 'AI summary is being generated.' }: { text?: string | null; fallback?: string }) {
  if (!text) {
    return <p className="text-sm text-muted-foreground italic">{fallback}</p>;
  }

  const lines = text.split('\n').map(classifyLine);

  // Group into sections: each numbered line starts a new section block
  type Section = { header: ParsedLine; children: ParsedLine[] };
  const sections: Section[] = [];
  let loose: ParsedLine[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    if (line.type === 'empty') continue;

    if (line.type === 'numbered') {
      if (current) sections.push(current);
      current = { header: line, children: [] };
    } else if (current) {
      current.children.push(line);
    } else {
      loose.push(line);
    }
  }
  if (current) sections.push(current);

  const renderLoose = (items: ParsedLine[]) =>
    items.map((l, i) => {
      if (l.type === 'bullet') {
        return (
          <div key={i} className="flex items-start gap-2.5 py-1">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {l.label && <span className="font-medium text-foreground">{l.label}: </span>}
              {l.body}
            </p>
          </div>
        );
      }
      return (
        <p key={i} className="text-sm text-foreground leading-relaxed">
          {l.body}
        </p>
      );
    });

  if (sections.length === 0) {
    // Fallback: no numbered structure, just render paragraphs/bullets
    return (
      <div className="space-y-2">
        {renderLoose(loose)}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Loose paragraphs before any section */}
      {loose.length > 0 && (
        <div className="space-y-1.5 pb-2 border-b border-border/40">
          {renderLoose(loose)}
        </div>
      )}

      {sections.map((section, si) => (
        <div key={si} className="border-b border-border/30 last:border-0">
          {/* Section header */}
          <div className="flex items-start gap-3 py-3">
            <span className="h-5 w-5 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 mt-0.5">
              {section.header.sectionNumber}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {section.header.label}
                {section.header.body && (
                  <span className="font-normal text-muted-foreground ml-1">— {section.header.body}</span>
                )}
              </p>

              {/* Children: bullets and paragraphs */}
              {section.children.length > 0 && (
                <div className="mt-2 space-y-1 pl-1">
                  {section.children.map((child, ci) => {
                    if (child.type === 'bullet') {
                      return (
                        <div key={ci} className="flex items-start gap-2 py-0.5">
                          <ChevronRight className="h-3.5 w-3.5 text-primary/60 mt-0.5 shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {child.label && (
                              <span className="font-medium text-foreground">{child.label}: </span>
                            )}
                            {child.body}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={ci} className="text-sm text-muted-foreground leading-relaxed pl-1">
                        {child.body}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ReportDetail page ───────────────────────────────────────────────────

export default function ReportDetail() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, updateReport } = useApp();
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

  const buildReportText = () => {
    if (report.ocrContent) return report.ocrContent;
    if (report.extractedData) {
      const header = `${report.extractedData.testName} from ${report.extractedData.lab} on ${report.extractedData.date}`;
      const params = report.extractedData.parameters
        .map(p => `${p.name}: ${p.value} ${p.unit} (ref ${p.referenceRange}) status: ${p.status}`)
        .join('\n');
      return `${header}\n\n${params}`;
    }
    const fallback = `${report.aiSummary ?? ''}\n\n${report.aiExplanation ?? ''}`.trim();
    return fallback || 'No structured report text available.';
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const text = buildReportText();
      const [aiSummary, aiExplanation] = await Promise.all([
        reasoningService.generateSummaryFromText(text, report.extractedData),
        reasoningService.generateExplanationFromText(text, report.extractedData),
      ]);
      updateReport(report.id, { aiSummary, aiExplanation });
    } catch (error) {
      console.error('Failed to regenerate report insights', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto animate-fade-in space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Report header card */}
        <section className="bg-card border rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-foreground">
                {report.extractedData?.testName || 'Medical Report'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {[report.extractedData?.lab, report.extractedData?.date].filter(Boolean).join(' · ') || report.fileName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={statusTone} />
                <Badge variant="outline">{abnormalCount} flagged markers</Badge>
                <AiBadge />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                onClick={() => navigate(`/chat?reportId=${report.id}`)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-primary/20 hover:bg-primary/5"
              >
                <MessageCircle className="h-4 w-4 text-primary" /> Ask AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Regenerating</>
                ) : (
                  <><RotateCcw className="h-4 w-4" /> Regenerate</>
                )}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-4">

            {/* Key Highlights */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Key Highlights</h3>
                <AiBadge />
              </div>
              <div className="space-y-2">
                {/* Priority 1: AI-generated key highlights from structured insights */}
                {(report.aiInsights?.keyHighlights?.length ?? 0) > 0 ? (
                  report.aiInsights!.keyHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{highlight}</p>
                    </div>
                  ))
                ) : abnormalCount > 0 ? (
                  /* Priority 2: Abnormal parameters fallback */
                  report.extractedData?.parameters.filter(p => p.status !== 'normal').slice(0, 4).map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                      <SeverityBadge severity={p.status === 'abnormal' ? 'elevated' : p.status} />
                      <div className="text-sm leading-relaxed">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-muted-foreground">: {p.value} {p.unit}</span>
                        <span className="text-xs text-muted-foreground/70 ml-1">(ref {p.referenceRange})</span>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Priority 3: No highlights */
                  <p className="text-sm text-muted-foreground">No flagged highlights detected in this report.</p>
                )}
              </div>
            </div>

            {/* Detailed Report — formatted */}
            <div className="bg-card border rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Detailed Report</h3>
                <AiBadge className="ml-auto" />
              </div>

              <ReportTextRenderer text={report.aiSummary} />

              {report.aiExplanation && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <ReportTextRenderer text={report.aiExplanation} />
                </div>
              )}

              {report.extractedData?.parameters.length ? (
                <p className="mt-4 text-xs text-muted-foreground/70 border-t border-border/30 pt-3">
                  Based on extracted clinical data from {report.extractedData.lab} ({report.extractedData.date}).
                </p>
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-4 space-y-4">
            <div className="hidden xl:block space-y-4">
              {/* AI Summary */}
              <div className="bg-card border rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
                  <AiBadge />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {report.aiSummary || 'AI summary is being generated.'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Confidence: 87% (simulated)
                </div>
              </div>

              {/* Document preview */}
              {report.previewUrl && (
                <div className="bg-card border rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Document Preview</h3>
                    </div>
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      title="View full screen"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:block">Full screen</span>
                    </button>
                  </div>
                  {report.fileType === 'pdf' ? (
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="block w-full h-56 rounded-xl overflow-hidden border bg-background hover:ring-2 hover:ring-primary/30 transition-all cursor-zoom-in"
                    >
                      <iframe src={report.previewUrl} title={report.fileName} className="w-full h-full pointer-events-none" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="group w-full flex items-center justify-center rounded-xl overflow-hidden border bg-muted/30 hover:ring-2 hover:ring-primary/30 transition-all cursor-zoom-in relative"
                    >
                      <img
                        src={report.previewUrl}
                        alt={report.fileName}
                        className="max-h-56 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Maximize2 className="h-3 w-3" /> View full size
                        </span>
                      </div>
                    </button>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground/70 break-all">{report.extractedData?.testName || report.fileName}</p>
                </div>
              )}

              {/* Data sources */}
              <div className="bg-card border rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Data Sources</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Structured clinical data extracted from the uploaded document',
                    'Lab markers and status classification',
                    'AI-generated reasoning from combined clinical context',
                  ].map(s => (
                    <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile accordion */}
            <div className="xl:hidden bg-card border rounded-2xl overflow-hidden">
              <Accordion type="single" collapsible defaultValue="summary">
                <AccordionItem value="summary">
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm font-semibold text-foreground">AI Summary</span>
                      <AiBadge />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      {report.aiSummary || 'AI summary is being generated.'}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      Confidence: 87% (simulated)
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sources">
                  <AccordionTrigger className="px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Data Sources</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ul className="space-y-2">
                      {[
                        'Structured clinical data extracted from the uploaded document',
                        'Lab markers and status classification',
                        'AI-generated reasoning from combined clinical context',
                      ].map(s => (
                        <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </aside>
        </section>
      </div>

      {/* Full-screen document preview dialog */}
      {report.previewUrl && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-5xl w-full p-2 sm:p-3 bg-background/95 backdrop-blur-md" aria-describedby={undefined}>
            <DialogTitle className="sr-only">
              {report.extractedData?.testName || report.fileName || 'Document Preview'}
            </DialogTitle>
            <DialogDescription className="sr-only">Full-screen preview of the uploaded medical document.</DialogDescription>
            {report.fileType === 'pdf' ? (
              <div className="w-full h-[80vh] rounded-xl overflow-hidden border bg-background">
                <iframe src={report.previewUrl} title={report.fileName} className="w-full h-full" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full max-h-[85vh] overflow-auto rounded-xl bg-muted/20">
                <img
                  src={report.previewUrl}
                  alt={report.extractedData?.testName || report.fileName}
                  className="max-w-full h-auto rounded-xl object-contain"
                />
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground mt-1 pb-1">
              {report.extractedData?.testName || report.fileName}
            </p>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
