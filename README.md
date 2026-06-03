# Render.com Backend

Same Express app as `server/` — but runs as a **persistent server** on Render.com.

## Why Render?

| | Vercel Hobby | Render Free |
|---|---|---|
| Function timeout | **10s** (kills Gemini) | **Unlimited** |
| Cold start | None (serverless) | 30-60s after 15min idle |
| Cost | Free | Free |

Use Render when you want Gemini to always respond first without timeout.

## Deploy to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `render-server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add all environment variables from `.env.example`
5. Deploy

## Keep Alive (prevent sleep)

Add a free UptimeRobot monitor:
- URL: `https://your-app.onrender.com/api/health`
- Interval: **14 minutes**

This prevents the 15-minute sleep and eliminates cold starts.

## Switch Backend from Admin Panel

Once deployed, go to Admin Dashboard → Settings → Backend Config
and enter your Render URL. The frontend will switch to Render automatically.
