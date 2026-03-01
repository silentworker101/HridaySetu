export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ReportExtractedData {
  testName: string;
  parameters: {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
  date: string;
  lab: string;
  doctor?: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: ReportExtractedData;
  aiSummary?: string;
  aiExplanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  reportId?: string;
}

export interface ChatSession {
  id: string;
  reportId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface AnalyticsData {
  totalReports: number;
  totalPatients: number;
  totalDoctors: number;
  reportsThisMonth: number;
  aiAnalyses: number;
  activeChats: number;
}
