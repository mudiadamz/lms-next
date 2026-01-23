# 🚀 Quick Deploy Guide - LMS ke Vercel

Panduan cepat untuk deploy LMS ke Vercel dalam 5 menit.

## ⚡ Quick Start

### 1. Deploy Frontend ke Vercel (2 menit)

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Deploy (di root project)
vercel

# Set production
vercel --prod
```

**Done!** Frontend sudah di Vercel. Copy URL yang diberikan.

### 2. Deploy Backend ke Railway (3 menit)

```bash
cd server

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize & Deploy
railway init
railway up

# Set environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production

# Get URL
railway domain
```

**Done!** Backend sudah di Railway. Copy URL yang diberikan.

### 3. Connect Frontend ke Backend (1 menit)

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `https://your-railway-url.up.railway.app/api`
3. Redeploy: Vercel Dashboard → Deployments → ... → Redeploy

**Done!** 🎉

---

## 🔧 Setup Database

Setelah backend deployed, initialize database:

```bash
cd server
railway shell
npm run migrate
npm run seed
exit
```

Atau via Railway Dashboard → Shell → Run commands.

---

## ✅ Test

1. Buka frontend URL dari Vercel
2. Login dengan:
   - Username: `student`
   - Password: `password`

Jika berhasil login, deployment berhasil! 🎊

---

## 📝 Environment Variables

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### Railway (Backend)
```
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=production
PORT=3000
```

---

## 🆘 Troubleshooting

**CORS Error?**
- Pastikan backend URL sudah benar di Vercel env vars
- Check Railway logs untuk error

**Database Error?**
- Run migration: `railway shell` → `npm run migrate`

**Build Failed?**
- Check logs di Vercel/Railway dashboard
- Pastikan semua dependencies terinstall

---

## 📚 Full Documentation

Lihat `DEPLOY_GUIDE.md` untuk dokumentasi lengkap.
