import { AppLayout } from '@/components/layout/AppLayout';
import { UploadZone } from '@/components/upload/UploadZone';

export default function UploadPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Upload Medical Report</h1>
          <p className="text-muted-foreground mt-1">Upload a PDF or image to generate OCR extraction, AI summary, and recommendations.</p>
        </div>
        <UploadZone />
      </div>
    </AppLayout>
  );
}
