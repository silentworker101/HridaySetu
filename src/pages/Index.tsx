import { Heart, Stethoscope, Shield, ArrowRight, Sparkles, Lock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import heroBg from '@/assets/hero-bg.jpg';

const roles: { role: UserRole; title: string; description: string; icon: typeof Heart }[] = [
  { role: 'patient', title: 'Patient', description: 'View reports, get AI insights, chat with AI assistant', icon: Heart },
  { role: 'doctor', title: 'Doctor', description: 'Manage patients, review reports, clinical AI support', icon: Stethoscope },
  { role: 'admin', title: 'Admin', description: 'System analytics, user management, monitoring', icon: Shield },
];

export default function Index() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,hsl(var(--accent))_0,hsl(var(--background))_45%)]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/90 border text-xs text-muted-foreground mb-5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered clinical intelligence
          </div>
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-elevated">
            <Heart className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            HridaySetu
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-xl">
            Privacy-first AI healthcare workspace for patients, doctors, and hospital admins.
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pb-16">
        <div className="w-full max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">Select your portal</h2>
            <p className="text-sm text-muted-foreground mt-1">No login required in prototype mode.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {roles.map(({ role, title, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="group bg-card border rounded-2xl p-5 sm:p-6 text-left hover:shadow-elevated hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:gradient-primary transition-all duration-300">
                <Icon className="h-6 w-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Privacy-first by design
            </div>
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Context-aware AI insights
            </div>
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Dashboard-first workflow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
