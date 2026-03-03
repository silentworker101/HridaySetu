import { FileText, Image, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Report } from '@/types';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from '@/components/common/SeverityBadge';

const statusConfig = {
  processing: { icon: Clock, label: 'Processing', className: 'text-warning bg-warning/10' },
  completed: { icon: CheckCircle, label: 'Completed', className: 'text-success bg-success/10' },
  failed: { icon: AlertCircle, label: 'Failed', className: 'text-destructive bg-destructive/10' },
};

export function ReportCard({ report }: { report: Report }) {
  const navigate = useNavigate();
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;
  const FileIcon = report.fileType === 'pdf' ? FileText : Image;
  const abnormalCount = report.extractedData?.parameters.filter(p => p.status !== 'normal').length || 0;
  const maxSeverity = report.extractedData?.parameters.some(p => p.status === 'critical')
    ? 'critical'
    : abnormalCount > 0
      ? 'elevated'
      : 'normal';

  return (
    <div
      onClick={() => navigate(`/reports/${report.id}`)}
      className="bg-card border rounded-2xl p-4 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FileIcon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {report.extractedData?.testName || report.fileName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{report.fileName}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.className}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            <SeverityBadge severity={maxSeverity} />
            {abnormalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-abnormal bg-abnormal/10">
                {abnormalCount} abnormal
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">
          {new Date(report.uploadedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
