import { AppLayout } from '@/components/layout/AppLayout';
import { Server, Database, Cpu, Wifi, CheckCircle } from 'lucide-react';
import { AiBadge } from '@/components/common/AiBadge';

const services = [
  { name: 'OCR Service (olmOCR-2-7B)', status: 'operational', icon: Cpu },
  { name: 'Reasoning Engine (Nova Lite 2)', status: 'operational', icon: Cpu },
  { name: 'Chat Service', status: 'operational', icon: Wifi },
  { name: 'Database', status: 'operational', icon: Database },
  { name: 'File Storage', status: 'operational', icon: Server },
];

export default function SystemPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">System Monitoring</h1>
          <AiBadge />
        </div>
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="text-sm font-semibold text-foreground">Service Status</h3>
          </div>
          <div className="divide-y">
            {services.map(s => (
              <div key={s.name} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Operational
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-accent border border-primary/20 rounded-2xl p-5">
          <p className="text-sm text-accent-foreground">
            <strong>Note:</strong> This is a prototype monitoring view. All services are simulated. 
            In production, real-time health checks and metrics will be displayed here.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
