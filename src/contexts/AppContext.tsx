import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Report, ChatSession } from '@/types';
import { mockUsers, mockReports, mockChatSessions } from '@/services/mockData';

interface AppContextType {
  currentUser: User | null;
  setRole: (role: UserRole) => void;
  reports: Report[];
  addReport: (report: Report) => void;
  chatSessions: ChatSession[];
  addChatSession: (session: ChatSession) => void;
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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);

  const setRole = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role) || null;
    setCurrentUser(user);
  };

  const addReport = (report: Report) => setReports(prev => [report, ...prev]);
  const addChatSession = (session: ChatSession) => setChatSessions(prev => [session, ...prev]);
  const updateChatSession = (id: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <AppContext.Provider value={{ currentUser, setRole, reports, addReport, chatSessions, addChatSession, updateChatSession }}>
      {children}
    </AppContext.Provider>
  );
};
