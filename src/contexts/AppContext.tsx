import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Report, ChatSession, ChatMessage } from '@/types';
import { mockUsers, mockReports } from '@/services/mockData';

interface AppContextType {
  currentUser: User | null;
  setRole: (role: UserRole) => void;
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  chatSessions: ChatSession[];
  createChatSession: (title: string, reportId?: string) => ChatSession;
  appendChatMessage: (sessionId: string, message: ChatMessage) => void;
  updateChatSession: (id: string, session: Partial<ChatSession>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const setRole = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role) || null;
    setCurrentUser(user);
  };

  const addReport = (report: Report) => setReports(prev => [report, ...prev]);
  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const createChatSession = (title: string, reportId?: string): ChatSession => {
    const session: ChatSession = {
      id: `c-${Date.now()}`,
      userId: currentUser?.id ?? '',
      title,
      reportId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatSessions(prev => [session, ...prev]);
    return session;
  };

  const appendChatMessage = (sessionId: string, message: ChatMessage) => {
    setChatSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, messages: [...s.messages, message] } : s)),
    );
  };
  const updateChatSession = (id: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setRole,
        reports,
        addReport,
        updateReport,
        chatSessions,
        createChatSession,
        appendChatMessage,
        updateChatSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
