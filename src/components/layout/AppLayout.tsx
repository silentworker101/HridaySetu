import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useApp } from '@/contexts/AppContext';

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b px-4 bg-card">
            <SidebarTrigger />
            <div className="flex-1" />
            {currentUser && (
              <span className="text-sm text-muted-foreground capitalize">
                {currentUser.role} Portal
              </span>
            )}
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
