/**
 * Vercel serverless: POST /api/ai-insights
 * Calls Groq so the API key stays on the server. Set GROQ_API_KEY in Vercel env.
 */

/**
 * Vercel serverless: POST /api/ai-insights
 * Calls Groq so the API key stays on the server. Set GROQ_API_KEY in Vercel env.
 */

function getSituation(income, expenses) {
  const totalObligations = Object.values(expenses).reduce((s, v) => s + Number(v) || 0, 0);
  if (income <= 0) return 'no_income';
  if (totalObligations <= 0) return 'no_obligations';
  const ratio = totalObligations / income;
  if (ratio >= 0.7) return 'obligations_very_high';
  if (ratio >= 0.5) return 'obligations_high';
  if (ratio >= 0.3) return 'obligations_moderate';
  return 'obligations_low';
}

function buildPrompt(income, expenses) {
  const situation = getSituation(income, expenses);
  const parts =
    Object.keys(expenses).length > 0
      ? Object.entries(expenses)
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
          .join(', ')
      : 'None.';
  const situationBrief = {
    no_income: 'They have no or zero income entered.',
    no_obligations: 'They have income but no obligations or expenses listed yet.',
    obligations_very_high: 'Their obligations take most of their income; very little room left.',
    obligations_high: 'Their obligations are a large share of income; they are stretched.',
    obligations_moderate: 'Their obligations are a moderate share; some room but not a lot.',
    obligations_low: 'Their obligations are low relative to income; they have meaningful room.',
  }[situation];

  return (
    'You are giving financial insight to ONE specific person. Base your reply only on their situation below.\n\n' +
    `Their situation: ${situationBrief} (All amounts are in INR. Income: ${income}. Obligations breakdown: ${parts}.)\n\n` +
    'Rules for your reply:\n' +
    '- Do NOT include any numbers, percentages, or figures. Only words.\n' +
    '- Give exactly 3 short lines that fit THIS person. If they are stretched, speak to that. If they have room, speak to using it wisely. If they have no obligations yet, speak to that. Do not give generic advice that could apply to anyone.\n' +
    '- Be direct and thoughtful: what happens if they continue, or what would help someone in this exact situation, or a comparison that fits (e.g. people with similar balance often…).\n\n' +
    'Respond with exactly 3 lines. No numbers:'
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
          'You give short financial insights tailored to ONE person. You are told their situation in plain language (e.g. "obligations are high relative to income"). Your reply must fit that situation: if they are stretched, speak to strain and choices; if they have room, speak to using it well; if they have no obligations yet, speak to that. Never use numbers or figures in your reply. Never give generic advice—always match the situation you were given. Exactly 3 lines.',
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
