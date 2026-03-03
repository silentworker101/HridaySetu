import { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2, FileSearch, Brain, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ocrService, reasoningService } from '@/services/aiService';
import { Report } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { AiBadge } from '@/components/common/AiBadge';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser, addReport } = useApp();
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    setIsProcessing(true);
    setProgress(12);
    try {
      setProgress(38);
      const extractedData = await ocrService.extractFromFile(file);
      setProgress(66);
      const aiSummary = await reasoningService.generateSummary(extractedData);
      setProgress(84);
      const aiExplanation = await reasoningService.generateExplanation(extractedData);
      setProgress(100);
      const report: Report = {
        id: `r-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        fileName: file.name,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        uploadedAt: new Date().toISOString(),
        status: 'completed',
        extractedData,
        aiSummary,
        aiExplanation,
      };
      addReport(report);
      navigate(`/reports/${report.id}`);
    } catch {
      // handle error
    } finally {
      setTimeout(() => setProgress(0), 450);
      setIsProcessing(false);
    }
  };

  const FileIcon = file?.type.includes('pdf') ? FileText : Image;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 bg-card/90 ${
          isDragging ? 'border-primary bg-accent scale-[1.01]' : 'border-border hover:border-primary/50'
        }`}
      >
        {file ? (
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mx-auto">
              <FileIcon className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground break-all">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleUpload} disabled={isProcessing} className="gradient-primary text-primary-foreground">
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : 'Analyze Report'}
              </Button>
              <Button variant="outline" onClick={() => setFile(null)} disabled={isProcessing}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            {isProcessing && <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mx-auto">
              <Upload className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop your report here</p>
              <p className="text-sm text-muted-foreground mt-1">PDF or image files supported</p>
            </div>
            <label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                Browse Files
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 flex items-start gap-3">
          <FileSearch className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">OCR Extraction</p>
            <p className="text-xs text-muted-foreground mt-1">Medical fields are auto-structured from scan/image uploads.</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">AI Reasoning</p>
            <p className="text-xs text-muted-foreground mt-1">Highlights trends, abnormalities, and plain-language explanations.</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Privacy First</p>
            <p className="text-xs text-muted-foreground mt-1">Prototype mode with local mock services and no login required.</p>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-accent border border-primary/20">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-foreground">Running OCR extraction service...</span>
            </div>
            <AiBadge />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Processing with medical reasoning engine...</span>
          </div>
        </div>
      )}
    </div>
  );
}
