import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RotateCcw, FileText, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '@/types';
import { chatService } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { AiBadge } from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';

interface ChatPanelProps {
  initialMessages?: ChatMessage[];
  reportId?: string;
}

export function ChatPanel({ initialMessages = [], reportId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const suggestedPrompts = [
    'Summarize key abnormalities from this report.',
    'Which values should I monitor in 4 weeks?',
    'Explain this report in simple language.',
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      reportId,
    };
    setMessages(prev => [...prev, userMsg]);
    setLastPrompt(userMsg.content);
    setInput('');
    setIsLoading(true);
    try {
      const response = await chatService.sendMessage(userMsg.content, { reportId });
      setMessages(prev => [...prev, response]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastPrompt || isLoading) return;
    setIsLoading(true);
    try {
      const response = await chatService.sendMessage(lastPrompt, { reportId });
      setMessages(prev => [...prev, response]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">HridaySetu AI Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask me anything about your medical reports. I can explain test results, highlight concerns, and provide health insights.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs rounded-full border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
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
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
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
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AiBadge />
                  <Badge variant="outline" className="text-[11px]">Confidence: 84%</Badge>
                  <Badge variant="outline" className="text-[11px] gap-1"><FileText className="h-3 w-3" /> Report data</Badge>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
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
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div className="border-t p-3 sm:p-4 bg-card">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            AI-generated suggestions. Verify with a licensed clinician.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={handleRegenerate} disabled={!lastPrompt || isLoading} className="h-7 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your reports..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
