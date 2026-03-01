import { ReportExtractedData, ChatMessage } from '@/types';

// Placeholder AI service layer — to be replaced with real API calls

export const ocrService = {
  async extractFromFile(_file: File): Promise<ReportExtractedData> {
    // Simulates olmOCR-2-7B-1025-FP8 processing
    await new Promise(r => setTimeout(r, 2000));
    return {
      testName: 'General Health Panel',
      date: new Date().toISOString().split('T')[0],
      lab: 'AI Extracted Lab',
      parameters: [
        { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12.0-16.0', status: 'normal' },
        { name: 'Blood Sugar (Fasting)', value: '105', unit: 'mg/dL', referenceRange: '70-100', status: 'abnormal' },
        { name: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'normal' },
      ],
    };
  },
};

export const reasoningService = {
  async generateSummary(_data: ReportExtractedData): Promise<string> {
    await new Promise(r => setTimeout(r, 1500));
    const abnormal = _data.parameters.filter(p => p.status !== 'normal');
    if (abnormal.length === 0) return 'All parameters are within normal range. No immediate concerns identified.';
    return `${abnormal.length} parameter(s) require attention: ${abnormal.map(p => p.name).join(', ')}. Further evaluation recommended.`;
  },

  async generateExplanation(_data: ReportExtractedData): Promise<string> {
    await new Promise(r => setTimeout(r, 1500));
    return 'Your report has been analyzed by our AI system. The results show some areas that need attention. Please consult with your healthcare provider for personalized advice based on these findings.';
  },
};

export const chatService = {
  async sendMessage(_message: string, _context?: { reportId?: string }): Promise<ChatMessage> {
    await new Promise(r => setTimeout(r, 1200));
    const responses = [
      "Based on the report data, I can see that the values you're asking about are within the expected range for your age group. However, I'd recommend discussing any concerns with your doctor.",
      "That's a great question. The parameter you're referring to can be influenced by several factors including diet, exercise, stress, and medication. Let me break this down for you.",
      "Looking at your recent reports, I notice a trend that's worth monitoring. While individual values may appear normal, the pattern over time could indicate something worth discussing with your healthcare provider.",
      "I understand your concern. Medical reports can be overwhelming. The key takeaway from your results is that most values are within normal limits, with a few areas that might benefit from lifestyle modifications.",
    ];
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
    };
  },
};
