import { AlertTriangle, CheckCircle2, Siren, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Severity = 'normal' | 'abnormal' | 'critical' | 'elevated';

const severityConfig: Record<Severity, { label: string; icon: LucideIcon; className: string }> = {
  normal: {
    label: 'Normal',
    icon: CheckCircle2,
    className: 'bg-normal/10 text-normal border-normal/20',
  },
  abnormal: {
    label: 'Elevated',
    icon: AlertTriangle,
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  elevated: {
    label: 'Elevated',
    icon: AlertTriangle,
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  critical: {
    label: 'Critical',
    icon: Siren,
    className: 'bg-abnormal/15 text-abnormal border-abnormal/30',
  },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const { label, icon: Icon, className: tone } = severityConfig[severity];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium', tone, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
