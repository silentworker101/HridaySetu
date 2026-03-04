import { User, Report, ChatSession, AnalyticsData } from '@/types';

export const mockUsers: User[] = [
  { id: 'p1', name: 'Aarav Sharma', role: 'patient' },
  { id: 'p2', name: 'Priya Patel', role: 'patient' },
  { id: 'p3', name: 'Rahul Verma', role: 'patient' },
  { id: 'p4', name: 'Ananya Gupta', role: 'patient' },
  { id: 'd1', name: 'Dr. Meera Iyer', role: 'doctor' },
  { id: 'd2', name: 'Dr. Sanjay Rao', role: 'doctor' },
  { id: 'a1', name: 'Admin User', role: 'admin' },
];

export const mockReports: Report[] = [
  {
    id: 'r1', userId: 'p1', userName: 'Aarav Sharma', fileName: 'blood_test_jan.pdf', fileType: 'pdf',
    uploadedAt: '2026-02-28T10:30:00Z', status: 'completed',
    extractedData: {
      testName: 'Complete Blood Count (CBC)', date: '2026-02-28', lab: 'Apollo Diagnostics', doctor: 'Dr. Meera Iyer',
      parameters: [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.0-17.0', status: 'normal' },
        { name: 'WBC Count', value: '11500', unit: '/μL', referenceRange: '4000-11000', status: 'abnormal' },
        { name: 'Platelet Count', value: '250000', unit: '/μL', referenceRange: '150000-400000', status: 'normal' },
        { name: 'RBC Count', value: '5.1', unit: 'M/μL', referenceRange: '4.5-5.5', status: 'normal' },
        { name: 'Hematocrit', value: '42', unit: '%', referenceRange: '38-50', status: 'normal' },
      ],
    },
    aiSummary: 'CBC results are mostly within normal range. WBC count is slightly elevated (11,500/μL), which may indicate a mild infection or inflammation.',
    aiExplanation: 'Your blood test shows that most values are healthy. The white blood cell count is slightly higher than normal, which your body uses to fight infections. This could mean you had a mild cold or infection recently. No immediate concern, but a follow-up in 4-6 weeks is recommended.',
  },
  {
    id: 'r2', userId: 'p1', userName: 'Aarav Sharma', fileName: 'lipid_panel.pdf', fileType: 'pdf',
    uploadedAt: '2026-02-20T14:00:00Z', status: 'completed',
    extractedData: {
      testName: 'Lipid Panel', date: '2026-02-20', lab: 'Thyrocare',
      parameters: [
        { name: 'Total Cholesterol', value: '220', unit: 'mg/dL', referenceRange: '<200', status: 'abnormal' },
        { name: 'HDL Cholesterol', value: '55', unit: 'mg/dL', referenceRange: '>40', status: 'normal' },
        { name: 'LDL Cholesterol', value: '140', unit: 'mg/dL', referenceRange: '<100', status: 'abnormal' },
        { name: 'Triglycerides', value: '130', unit: 'mg/dL', referenceRange: '<150', status: 'normal' },
      ],
    },
    aiSummary: 'Total cholesterol and LDL are elevated. HDL and Triglycerides within range. Dietary modifications recommended.',
    aiExplanation: 'Your cholesterol levels need attention. Total cholesterol and LDL ("bad" cholesterol) are higher than ideal. Consider reducing saturated fats, increasing fiber intake, and regular exercise. Your HDL ("good" cholesterol) is at a healthy level.',
  },
  {
    id: 'r3', userId: 'p2', userName: 'Priya Patel', fileName: 'thyroid_panel.jpg', fileType: 'image',
    uploadedAt: '2026-02-25T09:00:00Z', status: 'completed',
    extractedData: {
      testName: 'Thyroid Function Test', date: '2026-02-25', lab: 'SRL Diagnostics',
      parameters: [
        { name: 'TSH', value: '5.8', unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'abnormal' },
        { name: 'T3', value: '1.2', unit: 'ng/mL', referenceRange: '0.8-2.0', status: 'normal' },
        { name: 'T4', value: '7.5', unit: 'μg/dL', referenceRange: '5.1-14.1', status: 'normal' },
      ],
    },
    aiSummary: 'TSH is elevated suggesting subclinical hypothyroidism. T3 and T4 are within normal range.',
    aiExplanation: 'Your thyroid stimulating hormone (TSH) is above the normal range, while other thyroid hormones are normal. This pattern is called subclinical hypothyroidism. It may cause fatigue or weight changes. Consult an endocrinologist for further evaluation.',
  },
  {
    id: 'r4', userId: 'p3', userName: 'Rahul Verma', fileName: 'diabetes_screening.pdf', fileType: 'pdf',
    uploadedAt: '2026-02-15T11:30:00Z', status: 'completed',
    extractedData: {
      testName: 'Diabetes Screening', date: '2026-02-15', lab: 'Metropolis Lab',
      parameters: [
        { name: 'Fasting Glucose', value: '118', unit: 'mg/dL', referenceRange: '70-100', status: 'abnormal' },
        { name: 'HbA1c', value: '6.2', unit: '%', referenceRange: '<5.7', status: 'abnormal' },
        { name: 'Post-Prandial Glucose', value: '155', unit: 'mg/dL', referenceRange: '<140', status: 'abnormal' },
      ],
    },
    aiSummary: 'All glucose parameters elevated. Results indicate pre-diabetes. Lifestyle modifications strongly recommended.',
    aiExplanation: 'Your blood sugar levels are higher than normal across all measures, placing you in the pre-diabetic range. This is an important warning sign. With diet changes, regular exercise, and weight management, pre-diabetes can often be reversed.',
  },
  {
    id: 'r5', userId: 'p2', userName: 'Priya Patel', fileName: 'vitamin_panel.pdf', fileType: 'pdf',
    uploadedAt: '2026-01-10T08:00:00Z', status: 'processing',
  },
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'c1', reportId: 'r1', title: 'About my CBC results',
    createdAt: '2026-02-28T11:00:00Z',
    messages: [
      { id: 'm1', role: 'user', content: 'What does an elevated WBC count mean?', timestamp: '2026-02-28T11:00:00Z', reportId: 'r1' },
      { id: 'm2', role: 'assistant', content: 'An elevated White Blood Cell (WBC) count, also called leukocytosis, typically indicates your body is fighting an infection or dealing with inflammation. Your count of 11,500/μL is slightly above the normal range of 4,000-11,000/μL. Common causes include:\n\n• Recent viral or bacterial infection\n• Physical stress or intense exercise\n• Allergic reactions\n• Certain medications\n\nSince the elevation is mild, it\'s usually not a cause for immediate concern. However, I\'d recommend a follow-up test in 4-6 weeks to ensure it returns to normal.', timestamp: '2026-02-28T11:00:30Z', reportId: 'r1' },
    ],
  },
];

export const mockAnalytics: AnalyticsData = {
  totalReports: 156,
  totalPatients: 48,
  totalDoctors: 12,
  reportsThisMonth: 23,
  aiAnalyses: 142,
  activeChats: 8,
};

export const monthlyReportData = [
  { month: 'Sep', reports: 12 },
  { month: 'Oct', reports: 18 },
  { month: 'Nov', reports: 15 },
  { month: 'Dec', reports: 22 },
  { month: 'Jan', reports: 20 },
  { month: 'Feb', reports: 23 },
];
