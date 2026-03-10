# Deploy Finance Tracker to Vercel (with AI insights)

Host the **web app + AI insights** on Vercel. The app runs in the browser; profile and obligations stay in local storage. AI insights use a **cloud API** (Groq or OpenAI) so they work without running Ollama.

## 1. One-time setup: get an API key for AI

Pick one (or both):

- **Groq (free, fast)** – [console.groq.com](https://console.groq.com) → create API key.
- **OpenAI** – [platform.openai.com](https://platform.openai.com) → create API key (paid; small usage is cheap).

## 2. Deploy to Vercel

1. Push this repo to GitHub (if you haven’t already).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Leave **Root Directory** as `.` (repo root).
4. **Environment variables** (Project Settings → Environment Variables). Add at least one of:

   | Name             | Value        | Notes                    |
   |------------------|-------------|---------------------------|
   | `GROQ_API_KEY`   | `gsk_...`   | Prefer for free + speed   |
   | `OPENAI_API_KEY` | `sk-...`    | Optional fallback         |

   No need to set `EXPO_PUBLIC_BACKEND_URL`: the app uses the same origin on Vercel so `/api/ai-insights` is used automatically.

5. **Deploy**. Vercel will:
   - Run `cd frontend && npm install`
   - Run `cd frontend && npm run build` (Expo static web export)
   - Serve the site from `frontend/dist` and `/api/*` from the `api/` folder.

## 3. After deploy

- Open the Vercel URL (e.g. `https://your-project.vercel.app`).
- Set profile (income, etc.) and add obligations.
- Click **Generate AI Insights** – it will call the serverless `/api/ai-insights` which uses Groq or OpenAI and return 3 short insights.

## Local development

- **Frontend only (no AI):** `cd frontend && npm run web` → [http://localhost:8081](http://localhost:8081). AI button will fail unless a backend is running.
- **Full stack (Ollama):** run the FastAPI backend (`cd backend && uvicorn server:app --port 8000`) and set `EXPO_PUBLIC_BACKEND_URL=http://localhost:8000` in `frontend/.env` so the app talks to your backend and Ollama.
- **Full stack (cloud AI):** run only the frontend and point it at a deployed Vercel URL that has `GROQ_API_KEY` or `OPENAI_API_KEY` set; then set `EXPO_PUBLIC_BACKEND_URL=https://your-deployment.vercel.app` in `frontend/.env`.

## Summary

| Where it runs | AI insights |
|---------------|-------------|
| **Vercel (this guide)** | Groq or OpenAI via serverless `/api/ai-insights` |
| **Local + FastAPI backend** | Ollama (or ngrok) via `AI_MODEL_ENDPOINT` |
