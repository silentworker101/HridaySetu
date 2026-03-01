import { AppLayout } from '@/components/layout/AppLayout';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useApp } from '@/contexts/AppContext';

export default function ChatPage() {
  const { chatSessions } = useApp();
  const latestSession = chatSessions[0];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] animate-fade-in">
        <div className="bg-card border rounded-xl h-full flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h1 className="text-lg font-display font-semibold text-foreground">AI Health Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by Nova Lite 2 • Context-aware medical Q&A</p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel initialMessages={latestSession?.messages || []} reportId={latestSession?.reportId} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
