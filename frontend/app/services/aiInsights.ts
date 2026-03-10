import { AIInsightsRequest, AIInsightsResponse } from '../types';

const getBackendUrl = (): string => {
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:8000';
};

export async function generateAIInsights(
  payload: AIInsightsRequest
): Promise<AIInsightsResponse> {
  const backendUrl = getBackendUrl();
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
