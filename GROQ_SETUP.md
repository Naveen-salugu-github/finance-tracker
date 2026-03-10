# Set up Groq for AI insights (no separate backend)

The app runs entirely on **Vercel**: the frontend and a small serverless API that calls Groq. You do **not** need a separate backend server. The Groq API key stays in Vercel (server-side only) and is never sent to the browser.

---

## 1. Get a Groq API key (free)

1. Go to **https://console.groq.com**
2. Sign up and create an **API key**.
3. Copy the key (`gsk_...`). Do not commit it or share it in chat.

---

## 2. Add the key in Vercel

1. Open your project on **vercel.com** → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** your Groq API key
3. Save.

---

## 3. Deploy

Redeploy the project (or push a new commit). Vercel will:

- Build the frontend (`cd frontend && npm run build`) and serve it from `frontend/dist`.
- Expose **`/api/ai-insights`** as a serverless function that calls Groq with your key.

The frontend uses the **same origin** when `EXPO_PUBLIC_BACKEND_URL` is not set, so it will call `https://your-app.vercel.app/api/ai-insights` automatically. No extra config needed.

---

## 4. Test

Open your Vercel URL → set profile and obligations → click **Generate AI Insights**. It should return 3 short insights via Groq.

---

## Summary

| What              | Where   | Note                          |
|-------------------|--------|-------------------------------|
| Frontend          | Vercel | Static export from `frontend/`|
| AI endpoint       | Vercel | `/api/ai-insights` → calls Groq |
| Groq API key      | Vercel | Env var `GROQ_API_KEY` only   |

No separate backend. One Vercel project, one env var.
