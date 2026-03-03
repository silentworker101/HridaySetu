import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary', className)}>
      <Bot className="h-3.5 w-3.5" />
      AI-generated
    </span>
  );
}
