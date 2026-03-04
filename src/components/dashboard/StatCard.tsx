import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantConfig = {
  default: {
    card: 'bg-card border',
    icon: 'bg-muted text-muted-foreground',
    bar: 'bg-border',
    trend: 'text-muted-foreground',
  },
  primary: {
    card: 'bg-gradient-to-br from-accent/80 to-card border-primary/20',
    icon: 'gradient-primary text-primary-foreground',
    bar: 'gradient-primary',
    trend: 'text-primary',
  },
  success: {
    card: 'bg-gradient-to-br from-success/8 to-card border-success/20',
    icon: 'bg-success text-success-foreground',
    bar: 'bg-success',
    trend: 'text-success',
  },
  warning: {
    card: 'bg-gradient-to-br from-warning/8 to-card border-warning/20',
    icon: 'bg-warning text-warning-foreground',
    bar: 'bg-warning',
    trend: 'text-warning',
  },
};

export function StatCard({ title, value, icon: Icon, trend, trendDirection = 'up', variant = 'default' }: StatCardProps) {
  const cfg = variantConfig[variant];

  return (
    <div className={`${cfg.card} rounded-2xl p-4 sm:p-5 shadow-card animate-fade-in flex flex-col gap-3 overflow-hidden relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-1 leading-none">{value}</p>
        </div>
        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${cfg.trend}`}>
          {trendDirection === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend}
        </div>
      )}

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${cfg.bar} opacity-60`} />
    </div>
  );
}
