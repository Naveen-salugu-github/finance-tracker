import { AIInsightsRequest, AIInsightsResponse } from '../types';

const backendUrl = (process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(
  /\/$/,
  ''
);

export async function generateAIInsights(
  payload: AIInsightsRequest
): Promise<AIInsightsResponse> {
  const response = await fetch(`${backendUrl}/api/ai-insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.insights) {
    const detail =
      typeof result?.detail === 'string' ? result.detail : 'AI insights unavailable.';
    throw new Error(detail);
  }

  return result as AIInsightsResponse;
}
