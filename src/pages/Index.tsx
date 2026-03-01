import { Heart, Stethoscope, Shield, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-elevated">
            <Heart className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            HridaySetu
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-md">
            AI-powered healthcare intelligence. Upload reports, get instant analysis, and understand your health better.
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 flex items-start justify-center px-6 pb-20 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
          {roles.map(({ role, title, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="group bg-card border rounded-2xl p-6 text-left hover:shadow-elevated hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
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
      </div>
    </div>
  );
}
