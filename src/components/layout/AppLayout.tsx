import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SidebarProvider>
        <div className="h-full flex w-full min-w-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent))_0%,hsl(var(--background))_55%)] overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full basis-0 overflow-hidden">
          <header className="h-14 flex items-center gap-3 border-b border-border/60 px-3 sm:px-4 lg:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <SidebarTrigger className="h-8 w-8 rounded-lg border border-border/70 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-muted-foreground/60 hidden sm:block font-medium">HridaySetu</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 hidden sm:block shrink-0" />
              <h1 className="text-sm font-display font-semibold text-foreground truncate">{pageTitle}</h1>
            </div>

            <div className="flex-1" />

            {/* User avatar */}
            {currentUser && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-foreground leading-none">{currentUser.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{currentUser.role} Portal</p>
                </div>
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/20 shrink-0">
                  {initials}
                </div>
              </div>
            )}
          </header>
          <main className="flex-1 min-h-0 min-w-0 overflow-auto p-3 sm:p-5 lg:p-6 flex flex-col w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
