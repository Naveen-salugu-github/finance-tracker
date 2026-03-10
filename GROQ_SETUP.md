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

1. In Vercel, set **Root Directory** to **`frontend`** (Project Settings → General). The build will run from the `frontend` folder.
2. Redeploy (or push a new commit). Vercel will run `npm install` and `npm run build` in `frontend`, serve the app from `frontend/dist`, and expose **`/api/ai-insights`** from `frontend/api/`.

The frontend uses the **same origin** when `EXPO_PUBLIC_BACKEND_URL` is not set, so it will call `https://your-app.vercel.app/api/ai-insights` automatically. No extra config needed.

---

## 4. Use Groq (not your local backend)

For the **Vercel** app to call the Groq serverless API, it must **not** be pointed at another backend.

- In Vercel → **Settings** → **Environment Variables**, **remove** `EXPO_PUBLIC_BACKEND_URL` if it exists (or leave it unset).
- If it’s set (e.g. to a Railway URL or `localhost`), the built app will call that URL for AI insights instead of your Vercel `/api/ai-insights`, so you’ll get the other backend’s response (e.g. local Ollama) and you won’t see “Powered by Groq”.
- After removing it, **redeploy** so the new build doesn’t bake in the old URL. Then the app will use the same origin and hit the Groq function; you should see “Powered by Groq” on the card.

---

## 5. Test

Open your Vercel URL → set profile and obligations → click **Generate AI Insights**. It should return 3 short insights via Groq.

---

## Summary

| What              | Where   | Note                          |
|-------------------|--------|-------------------------------|
| Frontend          | Vercel | Static export from `frontend/`|
| AI endpoint       | Vercel | `/api/ai-insights` → calls Groq |
| Groq API key      | Vercel | Env var `GROQ_API_KEY` only   |

No separate backend. One Vercel project, one env var.

**Local dev with a backend:** To point the app at your local FastAPI (e.g. Ollama), create `frontend/.env.local` (gitignored) with `EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`. Do not put that in committed `frontend/.env` or Vercel will bake it in and the deployed app will call localhost.
