import { AbnormalMarkerInsight, ChatMessage, OcrResult, ReportExtractedData } from '@/types';

const OCR_URL = import.meta.env.VITE_OCR_URL || '/api/ocr';
const ANALYSIS_URL = import.meta.env.VITE_AI_ANALYSIS_URL || '/api/analysis';
const ANALYSIS_MODEL = import.meta.env.VITE_AI_ANALYSIS_MODEL || 'm42-health/Llama3-Med42-8B';

const BASE_SYSTEM_PROMPT =
  'You are HridaySetu AI, a clinical assistant with full access to the patient\'s report. ' +
  'All "my X" questions refer to the report below. Answer with exact values and clinical meaning. ' +
  'Never say you cannot access data.';

interface ReportAiInsightsInternal {
  overallImpression: string;
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'unclear';
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('FileReader did not return a valid data URL'));
        return;
      }
      const base64 = dataUrl.slice(commaIndex + 1);
      console.log(`[Extraction] File: ${file.name} | Type: ${file.type} | Size: ${file.size} bytes | Base64 length: ${base64.length}`);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`FileReader failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const MAX_RETRIES = 3;
  const jsonBody = JSON.stringify(body);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: jsonBody,
    });

    if (res.ok) return res.json() as Promise<T>;

    // Retry on 503 (cold start) or 429 (rate limit) with exponential backoff
    if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES) {
      const delay = attempt * 3000;
      console.warn(`[API] ${res.status} from ${url} — retrying in ${delay / 1000}s (attempt ${attempt}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  throw new Error('Max retries exceeded');
}

/**
 * Builds a system prompt that includes the full report text.
 * The instruction is explicit so the model knows it HAS access to the data
 * and must use it — preventing trained "I cannot access" refusals.
 */
function buildSystemPromptWithReport(reportText: string): string {
  // With a 2048-token limit, cap report text so system prompt stays under ~800 tokens (~3200 chars).
  const MAX_REPORT_CHARS = 2400;
  const trimmed = reportText.length > MAX_REPORT_CHARS
    ? reportText.slice(0, MAX_REPORT_CHARS) + '\n[...truncated]'
    : reportText;

  return (
    BASE_SYSTEM_PROMPT +
    '\n\nREPORT:\n' + trimmed + '\n==='
  );
}

type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/**
 * Calls the clinical analysis engine with an optional conversation history
 * to support multi-turn conversational context.
 */
async function callAnalysisModel(
  systemPrompt: string,
  userMessage: string,
  history: ApiMessage[] = [],
  maxTokens = 1024,
): Promise<string> {
  const messages: ApiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // The endpoint enforces: input_tokens + max_new_tokens <= 2048.
  const MODEL_CTX_LIMIT = 2048;
  const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
  const estInputTokens = Math.ceil(totalChars / 4);
  const safeMaxTokens = Math.min(maxTokens, Math.max(128, MODEL_CTX_LIMIT - estInputTokens - 32));

  console.log(
    `[AI] input ≈${estInputTokens} tokens | max_new_tokens=${safeMaxTokens} | messages=${messages.length}`,
  );

  const body = {
    model: ANALYSIS_MODEL,
    messages,
    parameters: {
      max_new_tokens: safeMaxTokens,
      temperature: 0.4,
      top_p: 0.75,
      top_k: 150,
      do_sample: true,
    },
  };

  const data = await postJson<{
    choices: { message?: { content?: string } }[];
  }>(ANALYSIS_URL, body);

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from analysis engine');
  return content;
}

function cleanJsonLike(text: string): string {
  const stripped = text.replace(/```json|```/gi, '').trim();
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return stripped;
  return stripped.slice(firstBrace, lastBrace + 1);
}

// ── Document Extraction Service ───────────────────────────────

export const ocrService = {
  async run(file: File): Promise<OcrResult> {
    const image_base64 = await fileToBase64(file);

    if (!image_base64) {
      throw new Error('Failed to convert file to base64. The file may be empty or corrupted.');
    }

    console.log(`[Extraction] Sending request to ${OCR_URL} | base64 length: ${image_base64.length}`);

    const requestBody = {
      prompt: 'Extract text from this document.',
      image_base64,
      temperature: 0.1,
      max_new_tokens: 4096,
      do_sample: false,
    };

    const ocrResponse = await postJson<unknown>(OCR_URL, requestBody);

    console.log('[Extraction] Raw response:', JSON.stringify(ocrResponse).slice(0, 500));

    let text = '';
    if (Array.isArray(ocrResponse) && ocrResponse.length > 0) {
      const first = ocrResponse[0];
      if (typeof first === 'string') {
        try {
          const parsed = JSON.parse(first) as { text?: string };
          text = (parsed.text ?? '').trim();
        } catch {
          text = first.trim();
        }
      } else if (typeof first === 'object' && first !== null) {
        text = (String((first as Record<string, unknown>).text ?? '')).trim();
      }
    } else if (typeof ocrResponse === 'object' && ocrResponse !== null) {
      text = (String((ocrResponse as Record<string, unknown>).text ?? '')).trim();
    }

    if (!text) {
      throw new Error(
        `Extraction returned no text. Response was: ${JSON.stringify(ocrResponse).slice(0, 200)}`,
      );
    }

    console.log(`[Extraction] Success — extracted ${text.length} chars. Preview: ${text.slice(0, 150)}`);
    return { text, extractedData: { testName: '', date: '', lab: '', parameters: [] } };
  },
};

// ── Clinical Analysis Service ─────────────────────────────────

export const reasoningService = {
  async generateSummaryFromText(
    text: string,
    _extractedData?: ReportExtractedData,
  ): Promise<string> {
    const systemPrompt = buildSystemPromptWithReport(text);
    return callAnalysisModel(
      systemPrompt,
      'Summarize clinical findings in 4 sentences.',
      [],
      512,
    );
  },

  async generateExplanationFromText(
    text: string,
    _extractedData?: ReportExtractedData,
  ): Promise<string> {
    const systemPrompt = buildSystemPromptWithReport(text);
    return callAnalysisModel(
      systemPrompt,
      'Explain this report in simple language. Note abnormalities.',
      [],
      512,
    );
  },

  async generateReportInsights(
    text: string,
    _extractedData?: ReportExtractedData,
  ): Promise<{ insights: ReportAiInsightsInternal | null; rawText: string }> {
    const insightsSystemPrompt =
      buildSystemPromptWithReport(text) +
      '\nRespond ONLY with minified JSON: ' +
      '{"overallImpression":"","severity":"low|moderate|high|critical|unclear",' +
      '"keyHighlights":[],"abnormalMarkers":[{"name":"","value":"","unit":"","status":"","interpretation":""}],' +
      '"possibleCauses":[],"whatToDoNext":[],"whenToSeekCare":"","followUpTests":[],"confidence":0.0}';

    const raw = await callAnalysisModel(
      insightsSystemPrompt,
      'Provide insights as JSON.',
      [],
      512,
    );
    const cleaned = cleanJsonLike(raw);

    try {
      const parsed = JSON.parse(cleaned) as Partial<ReportAiInsightsInternal>;

      const insights: ReportAiInsightsInternal = {
        overallImpression: parsed.overallImpression || 'No clear overall impression could be extracted.',
        severity: parsed.severity || 'unclear',
        keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [],
        abnormalMarkers: Array.isArray(parsed.abnormalMarkers) ? parsed.abnormalMarkers : [],
        possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
        whatToDoNext: Array.isArray(parsed.whatToDoNext) ? parsed.whatToDoNext : [],
        whenToSeekCare: parsed.whenToSeekCare || '',
        questionsToAskClinician: Array.isArray(parsed.questionsToAskClinician)
          ? parsed.questionsToAskClinician
          : [],
        followUpTests: Array.isArray(parsed.followUpTests) ? parsed.followUpTests : [],
        confidence:
          typeof parsed.confidence === 'number'
            ? parsed.confidence
            : parsed.confidence === null || parsed.confidence === undefined
              ? null
              : Number.isFinite(Number(parsed.confidence))
                ? Number(parsed.confidence)
                : null,
        rawText: raw,
      };

      return { insights, rawText: raw };
    } catch {
      console.warn('Failed to parse AI report insights JSON');
      return { insights: null, rawText: raw };
    }
  },
};

// ── Conversational Chat Service ───────────────────────────────

export const chatService = {
  /**
   * Sends a message to the clinical analysis engine.
   * Passes the full conversation history so the model maintains context
   * across multiple turns (conversational memory).
   */
  async sendMessage(
    message: string,
    context?: { reportText?: string; history?: ChatMessage[] },
  ): Promise<ChatMessage> {
    const systemPrompt = context?.reportText
      ? buildSystemPromptWithReport(context.reportText)
      : BASE_SYSTEM_PROMPT;

    // Build conversation history from prior turns (exclude the current message)
    const history: ApiMessage[] = (context?.history ?? []).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const content = await callAnalysisModel(systemPrompt, message, history, 1024);
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[AI Chat] Error:', err);
      return {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I could not reach the clinical analysis service. Please try again.',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
