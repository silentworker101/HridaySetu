import { AppLayout } from '@/components/layout/AppLayout';
import { UploadZone } from '@/components/upload/UploadZone';

export default function UploadPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Upload Medical Report</h1>
          <p className="text-muted-foreground mt-1">Upload a PDF or image of your medical report for AI-powered analysis</p>
        </div>
        <UploadZone />
      </div>
    </AppLayout>
  );
}
