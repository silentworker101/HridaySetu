import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantClasses = {
  default: 'bg-card',
  primary: 'bg-accent',
  success: 'bg-accent',
  warning: 'bg-accent',
};

const iconVariantClasses = {
  default: 'bg-muted text-muted-foreground',
  primary: 'gradient-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={`${variantClasses[variant]} rounded-xl p-5 shadow-card animate-fade-in border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-success mt-1">{trend}</p>}
        </div>
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${iconVariantClasses[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
