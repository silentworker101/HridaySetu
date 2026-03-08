import { AppLayout } from '@/components/layout/AppLayout';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useApp } from '@/contexts/AppContext';
import { AiBadge } from '@/components/common/AiBadge';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function ChatPage() {
  const { currentUser, chatSessions, createChatSession, reports } = useApp();
  const [searchParams] = useSearchParams();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const reportIdFromQuery = searchParams.get('reportId') || undefined;

  // Only show sessions belonging to the current user
  const userSessions = useMemo(
    () => chatSessions.filter(s => s.userId === currentUser?.id),
    [chatSessions, currentUser?.id],
  );

  // Most recent real (user-uploaded) report — never fall back to mock seed data.
  const mostRecentReport = useMemo(() => {
    const uploaded = reports.filter(r => r.status === 'completed' && (r.ocrContent || r.previewUrl));
    if (!uploaded.length) return undefined;
    return uploaded.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )[0];
  }, [reports]);

  // The report ID to use for context: explicit query param wins, otherwise fall back to most recent.
  const effectiveReportId = reportIdFromQuery ?? mostRecentReport?.id;

  // Reset active session when user changes (role switch)
  useEffect(() => {
    setActiveSessionId(null);
  }, [currentUser?.id]);

  useEffect(() => {
    if (activeSessionId) return;

    // Try to find an existing session for this user linked to the target report.
    const existingForReport = effectiveReportId
      ? userSessions.find(s => s.reportId === effectiveReportId)
      : undefined;

    if (existingForReport) {
      setActiveSessionId(existingForReport.id);
      return;
    }

    // No matching session — create a fresh one linked to the target report.
    const report = effectiveReportId ? reports.find(r => r.id === effectiveReportId) : undefined;
    const title = report
      ? `About my ${report.extractedData?.testName || 'Medical Report'}`
      : 'General health questions';

    const session = createChatSession(title, effectiveReportId);
    setActiveSessionId(session.id);
  }, [activeSessionId, userSessions, createChatSession, effectiveReportId, reports]);

  const activeSession = useMemo(
    () => userSessions.find(s => (activeSessionId ? s.id === activeSessionId : false)),
    [activeSessionId, userSessions],
  );

  const contextDate = activeSession?.createdAt
    ? new Date(activeSession.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Resolve the linked report for display
  const linkedReportId = activeSession?.reportId ?? effectiveReportId;
  const linkedReport = linkedReportId ? reports.find(r => r.id === linkedReportId) : undefined;
  const reportLabel = linkedReport
    ? (linkedReport.extractedData?.testName || 'Medical Report')
    : null;

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto flex-1 min-h-0 min-w-0 animate-fade-in flex flex-col gap-2">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-card border rounded-2xl flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden shadow-card w-full">
          <div className="px-4 sm:px-5 py-4 border-b">
            <h1 className="text-lg font-display font-semibold text-foreground">AI Health Assistant</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {reportLabel ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Context: {reportLabel} · {contextDate}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">General health questions · {contextDate}</span>
              )}
              <AiBadge />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {activeSession && (
              <ChatPanel
                sessionId={activeSession.id}
                initialMessages={activeSession.messages}
                reportId={activeSession.reportId ?? effectiveReportId}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
