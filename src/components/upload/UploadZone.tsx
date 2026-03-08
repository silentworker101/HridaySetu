import { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2, FileSearch, Brain, ShieldCheck, CloudUpload, Maximize2, FlaskConical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ocrService, reasoningService } from '@/services/aiService';
import { Report } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const STEP_LABELS = [
  'Extracting clinical data from document...',
  'Running AI analysis and interpretation...',
  'Generating health insights and recommendations...',
];

const SAMPLE_REPORTS = [
  { id: 's1', name: 'Serum Creatinine', lab: 'AIG Hospitals', src: '/samples/Sample_1.png' },
  { id: 's2', name: 'Arterial Blood Gases', lab: 'KIMS-ICON Hospital', src: '/samples/Sample_2.png' },
  { id: 's3', name: 'Liver Function Test', lab: 'Paridhi Pathology', src: '/samples/Sample_3.png' },
  { id: 's4', name: 'CBC & Haematology', lab: 'Fortis / Agilus Diagnostics', src: '/samples/Sample_4.png' },
  { id: 's5', name: 'Renal Panel', lab: 'Hospital Report', src: '/samples/Sample_5.png' },
];

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const { currentUser, addReport } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [zoomSample, setZoomSample] = useState<typeof SAMPLE_REPORTS[number] | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const handleSelectSample = async (sample: typeof SAMPLE_REPORTS[number]) => {
    setSelectedSample(sample.id);
    try {
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const sampleFile = new File([blob], `${sample.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
      setFile(sampleFile);
      setPreviewUrl(sample.src);
    } catch {
      toast({ title: 'Failed to load sample', description: 'Could not load the sample image.', variant: 'destructive' });
      setSelectedSample(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Choose a PDF or image to analyze.' });
      return;
    }
    if (!currentUser) {
      toast({ title: 'Select a role', description: 'Pick Patient/Doctor/Admin before uploading.' });
      return;
    }
    setIsProcessing(true);
    setStepIndex(0);
    setProgress(12);
    try {
      const { text: ocrText, extractedData } = await ocrService.run(file);
      setProgress(55);
      setStepIndex(1);
      const [aiSummary, aiExplanation, insightsResult] = await Promise.all([
        reasoningService.generateSummaryFromText(ocrText, extractedData),
        reasoningService.generateExplanationFromText(ocrText, extractedData),
        reasoningService.generateReportInsights(ocrText, extractedData),
      ]);
      setStepIndex(2);
      setProgress(100);
      const report: Report = {
        id: `r-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        fileName: file.name,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        previewUrl: previewUrl ?? URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        ocrContent: ocrText,
        extractedData,
        aiSummary,
        aiExplanation,
        aiInsights: insightsResult.insights ?? undefined,
      };
      addReport(report);
      navigate(`/reports/${report.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Upload/analysis error:', message);
      const is503 = message.includes('503');
      toast({
        title: is503 ? 'AI model is warming up' : 'Analysis failed',
        description: is503
          ? 'The AI service is starting up. Please wait 30 seconds and try again.'
          : message.length < 120 ? message : 'Could not complete OCR or AI analysis. Please retry in a moment.',
        variant: is503 ? 'default' : 'destructive',
      });
    } finally {
      setTimeout(() => setProgress(0), 450);
      setIsProcessing(false);
    }
  };

  const FileIcon = file?.type.includes('pdf') ? FileText : Image;
  const fileSizeLabel = file ? (file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`) : '';
  const fileTypeLabel = file?.type.includes('pdf') ? 'PDF' : 'Image';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 bg-card/90 ${
          isDragging
            ? 'border-primary bg-primary/5 ring-4 ring-primary/20 scale-[1.01]'
            : 'border-border hover:border-primary/40 hover:bg-accent/20'
        }`}
      >
        {file ? (
          <div className="space-y-4">
            {/* File icon */}
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-card">
              <FileIcon className="h-8 w-8 text-primary-foreground" />
            </div>

            {/* File info */}
            <div>
              <p className="font-semibold text-foreground break-all text-sm">{file.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">{fileTypeLabel}</Badge>
                <Badge variant="outline" className="text-xs">{fileSizeLabel}</Badge>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-2 rounded-2xl border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-left">Document preview</p>
                {file.type.includes('pdf') ? (
                  <div className="h-56 w-full rounded-xl overflow-hidden border bg-background">
                    <iframe src={previewUrl} title="PDF preview" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl overflow-hidden">
                    <img src={previewUrl} alt={file.name} className="max-h-56 object-contain rounded-xl border" />
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            {isProcessing && (
              <Progress value={progress} className="h-1.5 w-full max-w-sm mx-auto rounded-full" />
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleUpload} disabled={isProcessing} className="gradient-primary text-primary-foreground shadow-card">
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><CloudUpload className="h-4 w-4 mr-2" /> Analyze Report</>}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                disabled={isProcessing}
                className="gap-1.5"
              >
                <X className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-card ring-4 ring-primary/15">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Drop your report here</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PDF and image files (JPG, PNG)</p>
            </div>
            <label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity shadow-card">
                <Upload className="h-4 w-4" /> Browse Files
              </span>
            </label>
            <p className="text-xs text-muted-foreground/60">Max recommended: 10 MB</p>
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: FileSearch, title: 'Smart Document Extraction', desc: 'Converts scans and documents into structured, machine-readable clinical data.' },
          { icon: Brain, title: 'Clinical Intelligence Engine', desc: 'Generates AI-powered summaries, explanations, and recommendations from your report.' },
          { icon: ShieldCheck, title: 'Privacy-First', desc: 'Data is processed via your own configured endpoints. Nothing is shared externally.' },
        ].map(({ icon: FIcon, title, desc }) => (
          <div key={title} className="rounded-2xl border bg-card p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <FIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Processing steps */}
      {isProcessing && (
        <div className="space-y-2 animate-fade-in">
          {STEP_LABELS.map((label, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div
                key={label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isActive ? 'bg-accent border-primary/20' : isDone ? 'bg-success/5 border-success/20' : 'bg-muted/40 border-border/40 opacity-50'
                }`}
              >
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : isDone ? (
                  <span className="h-4 w-4 rounded-full bg-success flex items-center justify-center shrink-0">
                    <span className="h-2 w-2 bg-success-foreground rounded-full" />
                  </span>
                ) : (
                  <span className="h-4 w-4 rounded-full border border-border shrink-0" />
                )}
                <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sample Reports for Testing ───────────────────────── */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <FlaskConical className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sample Reports</h3>
            <p className="text-xs text-muted-foreground">Select any sample to preview or submit for AI analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_REPORTS.map(sample => {
            const isSelected = selectedSample === sample.id;
            return (
              <div
                key={sample.id}
                className={`group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary shadow-card'
                    : 'border-border/60 hover:border-primary/40 hover:shadow-md'
                }`}
                onClick={() => handleSelectSample(sample)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                  <img
                    src={sample.src}
                    alt={sample.name}
                    className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Zoom button */}
                  <button
                    onClick={e => { e.stopPropagation(); setZoomSample(sample); }}
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    title="Zoom preview"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{sample.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{sample.lab}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Zoom Preview Dialog ──────────────────────────────── */}
      <Dialog open={!!zoomSample} onOpenChange={open => { if (!open) setZoomSample(null); }}>
        <DialogContent className="max-w-4xl w-full p-2 sm:p-3 bg-background/95 backdrop-blur-md" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{zoomSample?.name ?? 'Sample Preview'}</DialogTitle>
          <DialogDescription className="sr-only">Full-size preview of {zoomSample?.name ?? 'sample report'}.</DialogDescription>
          {zoomSample && (
            <>
              <div className="flex items-center justify-center w-full max-h-[82vh] overflow-auto rounded-xl bg-muted/20">
                <img
                  src={zoomSample.src}
                  alt={zoomSample.name}
                  className="max-w-full h-auto rounded-xl object-contain"
                />
              </div>
              <div className="flex items-center justify-between px-2 pb-1">
                <div>
                  <p className="text-sm font-medium text-foreground">{zoomSample.name}</p>
                  <p className="text-xs text-muted-foreground">{zoomSample.lab}</p>
                </div>
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground shadow-card"
                  onClick={() => { handleSelectSample(zoomSample); setZoomSample(null); }}
                >
                  <CloudUpload className="h-3.5 w-3.5 mr-1.5" /> Select & Analyze
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
