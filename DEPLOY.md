# DEPLOY.md — BonApp Luxembourg MVP Deployment Guide

## Stack
- Frontend: Vercel (free tier)
- Backend: Render Web Service (free tier)
- Database: Render PostgreSQL (already exists: bonapp_db)

---

## Step 1 — Push code to GitHub

Create a new GitHub repository and push the project:

```bash
git init
git add .
git commit -m "feat: BonApp Luxembourg MVP"
git remote add origin https://github.com/YOUR_USERNAME/bonapp-luxembourg.git
git push -u origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `bonapp-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | Internal Database URL from bonapp_db (no SSL needed within Render) |
   | `CORS_ORIGIN` | `https://YOUR-APP.vercel.app` (fill after Vercel deploy) |

6. Click **Create Web Service**
7. Wait for build — note down the URL: `https://bonapp-backend.onrender.com`

### After backend deploys — run migration:
The schema is already applied (you ran db:migrate locally against the same DB).
No migration needed unless the DB is reset.

---

## Step 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Click **New Project → Import Git Repository**
3. Select your repo
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://bonapp-backend.onrender.com` |

6. Click **Deploy**
7. Note down your Vercel URL: `https://bonapp-luxembourg.vercel.app`

---

## Step 4 — Update CORS on Render

After Vercel deploy, go back to Render:
1. Open **bonapp-backend** service
2. **Environment → CORS_ORIGIN** → set to your actual Vercel URL
3. Click **Save Changes** → Render will redeploy automatically

---

## Step 5 — Verify deployment

Check these URLs:
- `https://bonapp-backend.onrender.com/api/health` → `{"ok":true}`
- `https://bonapp-backend.onrender.com/api/health/db` → `{"ok":true,"db_time":"..."}`
- `https://bonapp-backend.onrender.com/api/restaurants?cuisine=Italian&limit=3` → array
- `https://YOUR-APP.vercel.app` → BonApp home page

---

## Notes

### Render free tier cold starts
Render free Web Services spin down after 15 minutes of inactivity.
First request after inactivity may take 30–60 seconds.
This is acceptable for MVP validation phase.

### Internal DATABASE_URL on Render
When backend runs ON Render, use the Internal Database URL (no SSL required):
`postgresql://bonapp_db_user:PASSWORD@dpg-xxx/bonapp_db`
NOT the external Frankfurt URL.

### .env for local dev
Local backend/.env keeps the external Frankfurt URL with sslmode=require.
Never commit backend/.env to git.

---

## Quick checklist
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend /api/health returns ok
- [ ] Frontend deployed on Vercel
- [ ] VITE_API_URL set on Vercel
- [ ] CORS_ORIGIN updated on Render with Vercel URL
- [ ] Full flow tested on production URL
