import { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ocrService, reasoningService } from '@/services/aiService';
import { Report } from '@/types';
import { useNavigate } from 'react-router-dom';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    try {
      const extractedData = await ocrService.extractFromFile(file);
      const aiSummary = await reasoningService.generateSummary(extractedData);
      const aiExplanation = await reasoningService.generateExplanation(extractedData);
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
      setIsProcessing(false);
    }
  };

  const FileIcon = file?.type.includes('pdf') ? FileText : Image;

  return (
    <div className="max-w-lg mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          isDragging ? 'border-primary bg-accent scale-[1.02]' : 'border-border hover:border-primary/50'
        }`}
      >
        {file ? (
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mx-auto">
              <FileIcon className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleUpload} disabled={isProcessing} className="gradient-primary text-primary-foreground">
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : 'Analyze Report'}
              </Button>
              <Button variant="outline" onClick={() => setFile(null)} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
      {isProcessing && (
        <div className="mt-6 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-foreground">Running OCR extraction (olmOCR-2-7B)...</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Generating AI analysis (Nova Lite 2)...</span>
          </div>
        </div>
      )}
    </div>
  );
}
