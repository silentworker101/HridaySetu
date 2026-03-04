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

export interface OcrResult {
  text: string;
  extractedData: ReportExtractedData;
}

export type ReportSeverity = 'low' | 'moderate' | 'high' | 'critical' | 'unclear';

export interface AbnormalMarkerInsight {
  name: string;
  value?: string;
  unit?: string;
  status?: 'abnormal' | 'critical' | 'borderline';
  interpretation: string;
}

export interface ReportAiInsights {
  overallImpression: string;
  severity: ReportSeverity;
  keyHighlights: string[];
  abnormalMarkers: AbnormalMarkerInsight[];
  possibleCauses: string[];
  whatToDoNext: string[];
  whenToSeekCare: string;
  questionsToAskClinician: string[];
  followUpTests: string[];
  confidence: number | null;
  rawText?: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  previewUrl?: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  ocrContent?: string;
  extractedData?: ReportExtractedData;
  aiSummary?: string;
  aiExplanation?: string;
  aiInsights?: ReportAiInsights;
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
  userId: string;
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
