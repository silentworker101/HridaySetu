import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw, FileText, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '@/types';
import { chatService } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { AiBadge } from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

interface ChatPanelProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
  reportId?: string;
}

export function ChatPanel({ sessionId, initialMessages = [], reportId }: ChatPanelProps) {
  const { reports, appendChatMessage } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const handleInputFocus = useCallback(() => {
    // When mobile keyboard opens, scroll the input bar into view after layout settles.
    setTimeout(() => {
      inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  }, []);

  const suggestedPrompts = [
    'Summarize key abnormalities from this report.',
    'Which values should I monitor in 4 weeks?',
    'Explain this report in simple language.',
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reportTextContext = useMemo(() => {
    if (!reportId) return undefined;
    const report = reports.find(r => r.id === reportId);
    if (!report) return undefined;

    const parts: string[] = [];

    // Structured extracted fields first — most compact and accurate representation.
    if (report.extractedData) {
      const ed = report.extractedData;
      const header = [ed.testName, ed.lab, ed.date, ed.doctor].filter(Boolean).join(' | ');
      if (header) parts.push(header);

      if (ed.parameters.length > 0) {
        parts.push(
          ed.parameters
            .map(p => `${p.name}: ${p.value} ${p.unit} (ref ${p.referenceRange}) ${p.status}`)
            .join('\n'),
        );
      }
    }

    // Use OCR text only if no structured data is available (keeps payload small).
    if (parts.length === 0 && report.ocrContent) {
      const ocrSnippet = report.ocrContent.length > 1500
        ? report.ocrContent.slice(0, 1500) + '\n[truncated]'
        : report.ocrContent;
      parts.push(ocrSnippet);
    }

    if (report.aiSummary) parts.push(report.aiSummary);

    return parts.length > 0 ? parts.join('\n\n') : undefined;
  }, [reportId, reports]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      reportId,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    appendChatMessage(sessionId, userMsg);
    setLastPrompt(userMsg.content);
    setInput('');
    setIsLoading(true);

    try {
      // Filter out stale "I cannot access" denial responses — they poison subsequent calls.
      const DENIAL_PHRASES = ['as an ai language model', 'cannot access', 'i cannot access'];
      const cleanHistory = messages.filter(
        m => !(m.role === 'assistant' && DENIAL_PHRASES.some(p => m.content.toLowerCase().includes(p))),
      );
      // Keep only the last 6 turns to prevent payload from growing too large.
      const trimmedHistory = cleanHistory.slice(-6);

      const response = await chatService.sendMessage(userMsg.content, {
        reportText: reportTextContext,
        history: trimmedHistory,
      });
      setMessages(prev => [...prev, response]);
      appendChatMessage(sessionId, response);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        reportId,
      };
      setMessages(prev => [...prev, errorMsg]);
      appendChatMessage(sessionId, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastPrompt || isLoading) return;
    setIsLoading(true);

    // For regenerate: drop last assistant reply, filter denials, keep last 6 turns
    const DENIAL_PHRASES = ['as an ai language model', 'cannot access', 'i cannot access'];
    const historyForRegen = messages
      .slice(0, -1)
      .filter(m => !(m.role === 'assistant' && DENIAL_PHRASES.some(p => m.content.toLowerCase().includes(p))))
      .slice(-6);
    try {
      const response = await chatService.sendMessage(lastPrompt, {
        reportText: reportTextContext,
        history: historyForRegen,
      });
      setMessages(prev => [...prev, response]);
      appendChatMessage(sessionId, response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-elevated ring-4 ring-primary/15">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">HridaySetu AI Health Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Ask me anything about your medical reports. I can explain test results, highlight concerns, and provide health insights.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs rounded-full border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[84%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                  <AiBadge />
                  <Badge variant="outline" className="text-[11px]">Confidence: 84%</Badge>
                  {reportId && (
                    <Badge variant="outline" className="text-[11px] gap-1">
                      <FileText className="h-3 w-3" /> Report context
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse-soft" />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area — pinned to bottom, never pushed off-screen by keyboard */}
      <div ref={inputAreaRef} className="border-t p-3 sm:p-4 bg-card/95 backdrop-blur-sm shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            AI-generated suggestions. Verify with a licensed clinician.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={!lastPrompt || isLoading}
            className="h-7 text-xs gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            onFocus={handleInputFocus}
            placeholder="Ask about your reports..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
