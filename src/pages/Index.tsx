import { Heart, Stethoscope, Shield, ArrowRight, Sparkles, Lock, Activity, Brain, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import heroBg from '@/assets/hero-bg.jpg';

const roles: {
  role: UserRole;
  title: string;
  description: string;
  icon: typeof Heart;
  accent: string;
  features: string[];
}[] = [
  {
    role: 'patient',
    title: 'Patient',
    description: 'View your health reports, understand AI explanations, and chat with your AI assistant.',
    icon: Heart,
    accent: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 hover:border-rose-500/60',
    features: ['AI report insights', 'Health trend tracking', 'Secure chat assistant'],
  },
  {
    role: 'doctor',
    title: 'Doctor',
    description: 'Manage patients, review clinical reports, and get AI-assisted diagnostic summaries.',
    icon: Stethoscope,
    accent: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/60',
    features: ['Patient management', 'Clinical AI support', 'Abnormal marker alerts'],
  },
  {
    role: 'admin',
    title: 'Admin',
    description: 'Monitor platform analytics, manage users, and track system-level AI operations.',
    icon: Shield,
    accent: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 hover:border-violet-500/60',
    features: ['Usage analytics', 'User management', 'System monitoring'],
  },
];

const features = [
  {
    icon: Brain,
    title: 'Clinical Intelligence Engine',
    description: 'Reports are analyzed by a specialized medical reasoning model trained on clinical data.',
  },
  {
    icon: Lock,
    title: 'Privacy-First',
    description: 'Your data stays private. No external sharing, no tracking, no compromises.',
  },
  {
    icon: Activity,
    title: 'Real-Time Insights',
    description: 'Get instant parameter extraction, trend tracking, and recommendations.',
  },
];

export default function Index() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden flex items-center">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-72 h-72 bg-accent/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-10 pb-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 border border-primary/20 text-xs text-muted-foreground mb-6 shadow-card backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI-powered clinical intelligence · Prototype</span>
          </div>

          {/* Logo + title */}
          <div className="flex flex-col items-center gap-4 mb-5">
            <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center shadow-elevated ring-4 ring-primary/20">
              <Heart className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight leading-none">
                HridaySetu
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed">
                Privacy-first AI healthcare workspace for patients, doctors, and hospital admins.
              </p>
            </div>
          </div>

          {/* Floating stat chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/25 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> HIPAA-ready design
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-medium text-primary">
              <Brain className="h-3.5 w-3.5" /> Clinical Intelligence Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border text-xs font-medium text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" /> Real-time AI analysis
            </span>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pb-6">
        <div className="w-full max-w-5xl">
          <div className="mb-7 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Select your portal</h2>
            <p className="text-sm text-muted-foreground mt-1.5">No login required in prototype mode. Choose your role to continue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map(({ role, title, description, icon: Icon, accent, features: roleFeatures }) => (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className={`group bg-gradient-to-br ${accent} border rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-card/80 flex items-center justify-center shadow-card group-hover:shadow-elevated transition-shadow">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
                <ul className="space-y-1.5">
                  {roleFeatures.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t bg-card/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map(({ icon: FIcon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <FIcon className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground bg-card/40">
        <span>© {new Date().getFullYear()} HridaySetu · AI Healthcare Platform · Prototype</span>
      </footer>
    </div>
  );
}
