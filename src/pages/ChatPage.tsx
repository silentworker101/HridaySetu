import { AppLayout } from '@/components/layout/AppLayout';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useApp } from '@/contexts/AppContext';
import { AiBadge } from '@/components/common/AiBadge';

export default function ChatPage() {
  const { chatSessions } = useApp();
  const latestSession = chatSessions[0];
  const contextTitle = latestSession?.title || 'General Health Assistant';
  const contextDate = latestSession?.createdAt ? new Date(latestSession.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-7.5rem)] min-h-[560px] animate-fade-in">
        <div className="bg-card border rounded-2xl h-full flex flex-col overflow-hidden shadow-card">
          <div className="px-4 sm:px-5 py-4 border-b">
            <h1 className="text-lg font-display font-semibold text-foreground">AI Health Assistant</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Chat about {contextTitle} - {contextDate}
              </p>
              <AiBadge />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel initialMessages={latestSession?.messages || []} reportId={latestSession?.reportId} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
