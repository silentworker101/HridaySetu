import { AppLayout } from '@/components/layout/AppLayout';
import { mockUsers } from '@/services/mockData';
import { Stethoscope, CircleCheck } from 'lucide-react';

export default function DoctorsPage() {
  const doctors = mockUsers.filter(u => u.role === 'doctor');

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-1">Clinical users with AI assistant access</p>
        </div>
        <div className="space-y-2">
          {doctors.map(d => (
            <div key={d.id} className="bg-card border rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {d.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{d.role}</p>
              </div>
              <div className="flex items-center gap-2 text-success text-xs">
                <CircleCheck className="h-4 w-4" />
                Active
              </div>
              <Stethoscope className="h-5 w-5 text-muted-foreground hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
