# 🎯 Complete Deployment Guide

Panduan lengkap deploy Frontend + Backend API.

## 📋 Overview

- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Express + SQLite)
- **Database**: SQLite (persistent di Railway)

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Backend API (Railway)

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login ke Railway

```bash
railway login
```

#### 3. Deploy Backend

```bash
cd server

# Initialize (first time)
railway init
# Pilih: Create new project → Name: lms-backend

# Deploy
railway up
```

#### 4. Set Environment Variables

```bash
# Generate JWT secret
openssl rand -hex 32

# Set variables
railway variables set JWT_SECRET=your-generated-secret-key
railway variables set NODE_ENV=production
```

#### 5. Get Backend URL

```bash
railway domain
```

**Copy URL ini!** (contoh: `https://lms-backend.up.railway.app`)

#### 6. Initialize Database

```bash
railway shell
npm run migrate
npm run seed
exit
```

**Backend selesai!** ✅

---

### Part 2: Deploy Frontend (Vercel)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login ke Vercel

```bash
vercel login
```

#### 3. Deploy Frontend

```bash
# Di root project
vercel --prod
```

#### 4. Set Environment Variable

**Di Vercel Dashboard:**
1. Buka https://vercel.com/dashboard
2. Pilih project `lms`
3. Settings → Environment Variables
4. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend.up.railway.app/api` (URL dari Railway)
   - Environment: Production, Preview, Development

#### 5. Redeploy

```bash
vercel --prod
```

Atau di Dashboard → Deployments → Redeploy

**Frontend selesai!** ✅

---

### Part 3: Update CORS di Backend

Update `server/src/index.ts` untuk allow frontend URL:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app', // Tambahkan URL Vercel Anda
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];
```

Atau set di Railway:
```bash
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

Redeploy backend:
```bash
railway up
```

---

## ✅ Testing

### Test Backend

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Test login
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password"}'
```

### Test Frontend

1. Buka URL Vercel (contoh: `https://lms.vercel.app`)
2. Test login dengan:
   - Username: `student`
   - Password: `password`

---

## 🔧 Troubleshooting

### CORS Error

**Problem**: Frontend tidak bisa akses backend

**Solution**:
1. Set `FRONTEND_URL` di Railway variables
2. Atau update `allowedOrigins` di `server/src/index.ts`
3. Redeploy backend

### API Not Found

**Problem**: Frontend tidak bisa connect ke backend

**Solution**:
1. Check `VITE_API_BASE_URL` di Vercel Dashboard
2. Pastikan URL benar: `https://your-backend.up.railway.app/api`
3. Redeploy frontend

### Database Error

**Problem**: Database tidak ada atau error

**Solution**:
```bash
railway shell
npm run migrate
npm run seed
exit
```

### Build Failed

**Problem**: Deploy gagal

**Solution**:
```bash
# Test build lokal dulu
cd server
npm run build

# Fix errors sebelum deploy
```

---

## 📊 Monitoring

### Railway (Backend)
- Dashboard → Metrics: CPU, Memory, Network
- Dashboard → Logs: Application logs
- Dashboard → Settings → Networking: Domain

### Vercel (Frontend)
- Dashboard → Deployments: Deployment history
- Dashboard → Analytics: Traffic & performance
- Dashboard → Logs: Build & runtime logs

---

## 🔄 Auto-Deploy Setup

### Railway (Backend)

1. Railway Dashboard → Settings → Source
2. Connect GitHub repository
3. Set Root Directory: `server`
4. Enable Auto-Deploy

Setiap push ke `main` akan auto-deploy backend.

### Vercel (Frontend)

1. Vercel Dashboard → Settings → Git
2. Connect repository (jika belum)
3. Auto-deploy sudah enabled by default

Setiap push ke `main` akan auto-deploy frontend.

---

## 📝 Environment Variables Summary

### Railway (Backend)
```
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

---

## 🎉 Done!

Setelah semua step selesai:

1. ✅ Backend running di Railway
2. ✅ Frontend running di Vercel
3. ✅ Database initialized
4. ✅ CORS configured
5. ✅ Environment variables set
6. ✅ Auto-deploy enabled

**Your LMS is live!** 🚀

---

## 📚 Quick Reference

- **Backend URL**: `https://your-backend.up.railway.app`
- **Frontend URL**: `https://your-frontend.vercel.app`
- **API Base**: `https://your-backend.up.railway.app/api`
- **Health Check**: `https://your-backend.up.railway.app/health`

---

## 🆘 Need Help?

- Backend: Lihat `DEPLOY_API.md`
- Frontend: Lihat `QUICK_DEPLOY.md`
- Railway: Lihat `DEPLOY_RAILWAY.md`
- Troubleshooting: Check logs di Railway/Vercel Dashboard
