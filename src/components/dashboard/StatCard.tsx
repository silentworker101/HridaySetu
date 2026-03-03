import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantClasses = {
  default: 'bg-card border',
  primary: 'bg-gradient-to-br from-accent to-card border-primary/20',
  success: 'bg-gradient-to-br from-success/10 to-card border-success/25',
  warning: 'bg-gradient-to-br from-warning/10 to-card border-warning/25',
};

const iconVariantClasses = {
  default: 'bg-muted text-muted-foreground',
  primary: 'gradient-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={`${variantClasses[variant]} rounded-2xl p-4 sm:p-5 shadow-card animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-success mt-1">{trend}</p>}
        </div>
        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center ${iconVariantClasses[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
