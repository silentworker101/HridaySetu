import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Report',
  '/reports': 'Reports Library',
  '/chat': 'AI Assistant',
  '/insights': 'AI Analysis',
  '/patients': 'Patients',
  '/analytics': 'Analytics',
  '/system': 'System Monitoring',
  '/doctors': 'Doctors',
  '/search': 'Search',
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] ?? 'HridaySetu';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[radial-gradient(circle_at_top_right,hsl(var(--accent))_0,hsl(var(--background))_42%)]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-3 border-b px-3 sm:px-4 lg:px-6 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 sticky top-0 z-30">
            <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/80" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">HridaySetu</p>
              <h1 className="text-sm sm:text-base font-display font-semibold text-foreground truncate">{pageTitle}</h1>
            </div>
            <div className="flex-1" />
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-generated insights
            </Badge>
            {currentUser && (
              <span className="text-xs sm:text-sm text-muted-foreground capitalize">{currentUser.role} Portal</span>
            )}
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
