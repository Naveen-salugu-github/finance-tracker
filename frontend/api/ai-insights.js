/**
 * Vercel serverless: POST /api/ai-insights
 * Calls Groq so the API key stays on the server. Set GROQ_API_KEY in Vercel env.
 */

function buildPrompt(income, expenses) {
  const parts =
    Object.keys(expenses).length > 0
      ? Object.entries(expenses)
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
          .join(', ')
      : 'No expenses provided.';
  return (
    'Give 3 short lines of thoughtful, behavioural finance insight. Rules:\n' +
    '- Do NOT include any numbers, calculations, percentages, or figures in your response.\n' +
    '- No "net income", "remaining", or math. Only words and ideas.\n' +
    '- Instead: warn what happens if they keep spending like this, or encourage mindfulness, or compare to how others in a similar situation act, or give a good vs bad example. Be specific to their situation but without citing amounts.\n\n' +
    `Context (for you only; do not repeat these numbers): Income and obligations in INR — Income: ${income}. Obligations: ${parts}.\n\n` +
    'Respond with exactly 3 lines. No numbers in the response:'
  );
}

function formatInsights(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const lines = cleaned
    .split(/\n/)
    .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
  return lines.length ? lines.slice(0, 3).join('\n') : null;
}

const FALLBACK =
  'Spending patterns like this often creep up over time.\nPeople who pause and adjust early usually end up in a better place.\nSmall leaks sink ships—be mindful where it goes.';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ detail: 'Invalid JSON' });
  }

  const income = Number(body.income);
  const expenses = body.expenses && typeof body.expenses === 'object' ? body.expenses : {};
  if (Number.isNaN(income) || income < 0) return res.status(400).json({ detail: 'Invalid income' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ detail: 'AI insights unavailable.' });

  const prompt = buildPrompt(income, expenses);
  let raw = null;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content:
          'You give short, thoughtful financial insights. Never use numbers, calculations, or figures in your reply. Give behavioural wisdom: what happens if they continue, mindfulness, comparisons (e.g. people in similar situations), or good vs bad examples. Direct and honest, but no math.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 150,
  }),
    });
    if (r.ok) {
      const data = await r.json();
      raw = data?.choices?.[0]?.message?.content;
    }
  } catch (e) {
    console.error(e);
  }

  const insights = (raw && formatInsights(raw)) || FALLBACK;
  res.setHeader('X-AI-Provider', 'Groq');
  return res.status(200).json({ insights, provider: 'Groq' });
}
