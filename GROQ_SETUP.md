# Set up Groq for AI insights (commit 7b7aaa9 style)

Your app already has the AI insights feature. The frontend calls your **backend** at `EXPO_PUBLIC_BACKEND_URL` → `POST /api/ai-insights`. The backend now supports **Groq** (and optionally OpenAI or Ollama). To stop seeing "AI insights unavailable", configure the backend with Groq.

---

## 1. Get a Groq API key (free)

1. Go to **https://console.groq.com**
2. Sign up and create an **API key** (e.g. name: `finance-tracker`).
3. Copy the key (starts with `gsk_...`). Do not commit it or share it in chat.

---

## 2. Where does your backend run?

Your **frontend** is on Vercel. The **backend** (FastAPI) must be running somewhere and that URL is set as `EXPO_PUBLIC_BACKEND_URL` when you build the frontend.

- **If the backend is on Railway / Render / Fly.io / a VPS:**  
  Add the Groq key there.

- **If you only deployed the frontend to Vercel and have no backend:**  
  You need to deploy the backend first, then set `EXPO_PUBLIC_BACKEND_URL` to that URL and rebuild/redeploy the frontend.

---

## 3. Add Groq to the backend

On the **same place where the backend runs** (e.g. Railway project, Render service, or server):

1. Open **Environment variables** (or `.env` for a VPS).
2. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** your Groq API key (`gsk_...`)
3. Save and **restart/redeploy** the backend so it picks up the new variable.

No need to set `AI_MODEL_ENDPOINT` for production if you use Groq. The backend tries in this order: **Groq** → **OpenAI** → **Ollama**. If `GROQ_API_KEY` is set, it will use Groq.

---

## 4. Optional: use OpenAI instead

If you prefer OpenAI, set **`OPENAI_API_KEY`** (your OpenAI API key) on the backend instead of (or in addition to) `GROQ_API_KEY`. The backend will try Groq first, then OpenAI, then Ollama.

---

## 5. Check the frontend URL

Your frontend must call the backend URL. When you built the app for Vercel, you should have set:

- **`EXPO_PUBLIC_BACKEND_URL`** = your backend base URL (e.g. `https://your-backend.railway.app` or `https://your-backend.onrender.com`).

That value is baked in at **build time**. If you never set it, the app may be calling `http://localhost:8000`, which only works locally. So:

1. In your **frontend** build (e.g. Vercel build env or local before `expo export`), set `EXPO_PUBLIC_BACKEND_URL` to your real backend URL.
2. Rebuild and redeploy the frontend.

After that, clicking "Generate AI Insights" in the deployed app will call your backend, and the backend will use Groq and return the 3 insights.

---

## Summary

| Step | Where | What to do |
|------|--------|------------|
| 1 | Groq console | Create API key |
| 2 | Backend (Railway/Render/etc.) | Add env var `GROQ_API_KEY` = `gsk_...` |
| 3 | Backend | Restart/redeploy |
| 4 | Frontend build | Set `EXPO_PUBLIC_BACKEND_URL` to backend URL; rebuild & redeploy frontend |
