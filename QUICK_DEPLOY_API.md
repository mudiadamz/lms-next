# ⚡ Quick Deploy API - 5 Menit

Panduan cepat deploy backend API ke Railway.

## 🚀 Quick Start

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login

```bash
railway login
```

### 3. Deploy

```bash
cd server
railway init
railway up
```

### 4. Set Environment Variables

```bash
# Generate secret key
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production
```

### 5. Get URL

```bash
railway domain
```

Copy URL yang diberikan (contoh: `https://lms-backend.up.railway.app`)

### 6. Initialize Database

```bash
railway shell
npm run migrate
npm run seed
exit
```

**Done!** 🎉

## 📝 Update Frontend

Setelah backend deployed:

1. **Copy backend URL** dari Railway (misalnya: `https://lms-backend.up.railway.app`)
2. **Update di Vercel Dashboard**:
   - Project → Settings → Environment Variables
   - Set: `VITE_API_BASE_URL` = `https://lms-backend.up.railway.app/api`
3. **Redeploy frontend**

## ✅ Test API

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Test login
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password"}'
```

## 🔧 Troubleshooting

### Database tidak ada
```bash
railway shell
npm run migrate
npm run seed
```

### CORS Error
Update `server/src/index.ts` untuk include frontend URL di `allowedOrigins`.

### Port Error
Railway otomatis set PORT. Pastikan kode menggunakan `process.env.PORT`.

## 📚 Full Documentation

Lihat `DEPLOY_API.md` untuk dokumentasi lengkap dan opsi platform lain.
