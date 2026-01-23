# 🚀 Cara Deploy Backend API

Panduan lengkap untuk deploy backend API LMS ke berbagai platform.

## ⚠️ Penting: SQLite dan Platform

**SQLite memerlukan persistent storage**, jadi tidak cocok untuk:
- ❌ Vercel Serverless Functions (filesystem read-only)
- ✅ Railway (support persistent storage)
- ✅ Render (support persistent disk)
- ✅ Fly.io (support volumes)

## 🎯 Opsi 1: Railway (Recommended - Paling Mudah)

Railway sangat cocok untuk SQLite karena:
- ✅ Free tier tersedia
- ✅ Persistent storage otomatis
- ✅ Auto-deploy dari Git
- ✅ Mudah setup

### Langkah-langkah:

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login ke Railway

```bash
railway login
```

Ini akan membuka browser untuk autentikasi.

#### 3. Initialize Project

```bash
cd server
railway init
```

Pilih:
- **Create new project** → Beri nama: `lms-backend`
- Atau **Link to existing project** jika sudah ada

#### 4. Set Environment Variables

```bash
# Generate secret key
openssl rand -hex 32

# Set variables
railway variables set JWT_SECRET=your-generated-secret-key-min-32-chars
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

Atau via Railway Dashboard:
- Project → Variables → Add Variable

#### 5. Deploy

```bash
railway up
```

#### 6. Get URL

```bash
railway domain
```

Atau lihat di Railway Dashboard → Settings → Networking

#### 7. Initialize Database

Setelah deploy pertama, initialize database:

```bash
railway shell
npm run migrate
npm run seed
exit
```

Atau database akan auto-initialize karena ada di `railway.json` startCommand.

### Auto-Deploy dari Git

1. **Push code ke GitHub** (jika belum):
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Di Railway Dashboard**:
   - Settings → Source → Connect GitHub
   - Pilih repository `lms`
   - Set Root Directory: `server`
   - Enable Auto-Deploy

Setelah itu, setiap push ke `main` akan auto-deploy!

---

## 🎯 Opsi 2: Render

Render juga support persistent storage dan gratis untuk hobby projects.

### Langkah-langkah:

#### 1. Buat Account di Render

Buka https://render.com dan sign up dengan GitHub.

#### 2. Create Web Service

1. Klik **"New +"** → **"Web Service"**
2. Connect GitHub repository `lms`
3. Configure:
   - **Name**: `lms-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run migrate && npm start`
   - **Plan**: Free

#### 3. Set Environment Variables

Di Render Dashboard → Environment:
```
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

#### 4. Deploy

Klik **"Create Web Service"** - Render akan otomatis deploy.

#### 5. Get URL

Setelah deploy, copy URL dari Render dashboard.

---

## 🎯 Opsi 3: Fly.io

Fly.io support volumes untuk persistent storage.

### Langkah-langkah:

#### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Login

```bash
fly auth login
```

#### 3. Initialize

```bash
cd server
fly launch
```

Pilih:
- App name: `lms-backend`
- Region: Pilih yang terdekat
- Postgres: No (kita pakai SQLite)
- Redis: No

#### 4. Create Volume untuk Database

```bash
fly volumes create lms_db --size 1
```

#### 5. Update fly.toml

Edit `fly.toml` untuk mount volume:

```toml
[mounts]
  source = "lms_db"
  destination = "/app/database"
```

#### 6. Set Secrets

```bash
fly secrets set JWT_SECRET=your-secret-key
fly secrets set NODE_ENV=production
fly secrets set FRONTEND_URL=https://your-frontend.vercel.app
```

#### 7. Deploy

```bash
fly deploy
```

---

## 📋 Checklist Deployment

### Sebelum Deploy:

- [ ] Build lokal berhasil (`cd server && npm run build`)
- [ ] Test lokal (`npm start`)
- [ ] Environment variables sudah disiapkan
- [ ] Database migration script siap

### Setelah Deploy:

- [ ] Backend URL sudah didapat
- [ ] Health check berhasil (`/health` endpoint)
- [ ] Database sudah di-initialize
- [ ] Test API endpoints
- [ ] Update CORS untuk include frontend URL
- [ ] Update frontend `VITE_API_BASE_URL`

---

## 🔧 Update Frontend Setelah Deploy

Setelah backend deployed, update frontend:

### Di Vercel Dashboard:

1. Project → Settings → Environment Variables
2. Update atau Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
3. Redeploy

### Atau via CLI:

```bash
vercel env add VITE_API_BASE_URL production
# Masukkan backend URL saat diminta
vercel --prod
```

---

## 🐛 Troubleshooting

### Database tidak persist

**Railway**: Otomatis persist dengan volume
**Render**: Pastikan menggunakan persistent disk
**Fly.io**: Pastikan volume sudah di-mount

### Port error

Semua platform otomatis set `PORT` via environment variable. Pastikan kode menggunakan `process.env.PORT`.

### Build failed

```bash
# Test build lokal dulu
cd server
npm install
npm run build

# Jika ada error, fix dulu
```

### CORS Error

Update `server/src/index.ts` untuk include frontend URL:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app', // Tambahkan ini
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];
```

### Database migration error

```bash
# SSH ke platform dan run manual
railway shell  # atau fly ssh console
npm run migrate
npm run seed
```

---

## 📊 Monitoring

### Railway:
- Dashboard → Metrics: CPU, Memory, Network
- Dashboard → Logs: Application logs
- Dashboard → Settings → Networking: Domain

### Render:
- Dashboard → Logs: Real-time logs
- Dashboard → Metrics: CPU, Memory

### Fly.io:
```bash
fly logs
fly status
fly monitor
```

---

## 🎯 Quick Start (Railway)

```bash
# 1. Install & Login
npm i -g @railway/cli
railway login

# 2. Deploy
cd server
railway init
railway up

# 3. Set variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production

# 4. Get URL
railway domain

# 5. Initialize DB
railway shell
npm run migrate
npm run seed
exit
```

**Done!** 🎉

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)
