/**
 * Vercel serverless: POST /api/ai-insights
 * Uses Groq (free tier, fast) or OpenAI. Set GROQ_API_KEY or OPENAI_API_KEY in Vercel.
 */

function buildPrompt(income, expenses) {
  const expenseLines =
    Object.keys(expenses).length > 0
      ? Object.entries(expenses)
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
          .join(', ')
      : 'No expenses provided.';
  return (
    'Brutal finance take. Exactly 3 short lines. No intro.\n' +
    `Income: ${income}. Expenses: ${expenseLines}\n` +
    '3 lines only:'
  );
}

function formatInsights(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const lines = cleaned
    .split(/\n/)
    .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return lines.slice(0, 3).join('\n');
}

const FALLBACK_INSIGHTS =
  'Spending is unfocused.\nYour biggest expense needs scrutiny.\nCut waste before it compounds.';

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : null;
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ detail: 'Invalid JSON' });
  }

  const income = Number(body.income);
  const expenses = body.expenses && typeof body.expenses === 'object' ? body.expenses : {};
  if (Number.isNaN(income) || income < 0) {
    return res.status(400).json({ detail: 'Invalid income' });
  }

  const prompt = buildPrompt(income, expenses);
  let raw =
    (await callGroq(prompt)) ||
    (await callOpenAI(prompt)) ||
    null;

  const insights = (raw && formatInsights(raw)) || FALLBACK_INSIGHTS;

  return res.status(200).json({ insights });
}
