# Deployment Guide - LMS ke Vercel

Panduan lengkap untuk deploy Learning Management System ke Vercel.

## ⚠️ Penting: SQLite dan Vercel

**SQLite TIDAK cocok untuk Vercel Serverless Functions** karena:
- File system di Vercel adalah read-only (kecuali `/tmp`)
- Setiap invocation bisa di instance yang berbeda
- Tidak ada persistent storage

## ✅ Solusi yang Disarankan

### **Opsi 1: Frontend Vercel + Backend Railway** (Paling Mudah)

**Frontend → Vercel** (Gratis untuk hobby projects)
**Backend → Railway** (Free tier tersedia, support SQLite dengan persistent storage)

#### Langkah-langkah:

**1. Deploy Frontend ke Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (di root project)
vercel

# Set production
vercel --prod
```

**2. Set Environment Variable di Vercel Dashboard**
- Masuk ke: https://vercel.com/dashboard
- Pilih project → Settings → Environment Variables
- Tambahkan:
  ```
  VITE_API_BASE_URL=https://your-backend.railway.app/api
  ```
- Redeploy setelah set environment variable

**3. Deploy Backend ke Railway**

```bash
cd server

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set environment variables
railway variables set JWT_SECRET=your-very-long-secret-key-min-32-chars
railway variables set NODE_ENV=production

# Deploy
railway up

# Get URL
railway domain
```

**4. Initialize Database di Railway**

```bash
# SSH ke Railway
railway shell

# Run migration dan seed
npm run migrate
npm run seed

# Exit
exit
```

**5. Update Frontend Environment Variable**

Setelah backend deployed, copy URL dari Railway dan update di Vercel:
```
VITE_API_BASE_URL=https://your-app.up.railway.app/api
```

---

### **Opsi 2: Full Stack Vercel dengan PostgreSQL**

Jika ingin semua di Vercel, perlu convert ke PostgreSQL.

#### Langkah-langkah:

**1. Setup Vercel Postgres**
- Vercel Dashboard → Storage → Create Database → Postgres
- Copy connection string

**2. Install PostgreSQL Driver**
```bash
cd server
npm install pg @types/pg
```

**3. Update Database Connection**
- Ganti `better-sqlite3` dengan `pg`
- Update semua query ke PostgreSQL syntax
- Update schema untuk PostgreSQL

**4. Deploy**
```bash
vercel --prod
```

**Note:** Ini memerlukan refactoring yang cukup besar. Lebih mudah pakai Opsi 1.

---

### **Opsi 3: Frontend Vercel + Backend Render**

**Render** juga support persistent storage dan gratis untuk hobby projects.

```bash
cd server

# Install Render CLI (optional)
npm i -g render-cli

# Atau deploy via Render Dashboard:
# 1. Connect GitHub repo
# 2. Create Web Service
# 3. Set:
#    - Build Command: npm install && npm run build
#    - Start Command: npm run migrate && npm start
#    - Environment Variables: JWT_SECRET, NODE_ENV, PORT
```

---

## 📋 Checklist Deployment

### Frontend (Vercel)
- [ ] Install Vercel CLI
- [ ] Login ke Vercel
- [ ] Deploy frontend
- [ ] Set environment variable `VITE_API_BASE_URL`
- [ ] Test di production URL

### Backend (Railway/Render)
- [ ] Install Railway/Render CLI
- [ ] Login
- [ ] Initialize project
- [ ] Set environment variables:
  - [ ] `JWT_SECRET` (min 32 chars)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` (auto-set oleh platform)
- [ ] Deploy backend
- [ ] Run database migration
- [ ] Run database seed
- [ ] Test API endpoints
- [ ] Copy backend URL

### Final Steps
- [ ] Update `VITE_API_BASE_URL` di Vercel dengan backend URL
- [ ] Redeploy frontend
- [ ] Test login di production
- [ ] Test semua fitur utama

---

## 🔧 Environment Variables

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (Railway/Render)
```env
JWT_SECRET=your-very-long-secret-key-change-in-production-min-32-chars
NODE_ENV=production
PORT=3000
DB_PATH=./database/lms.db
```

---

## 🐛 Troubleshooting

### CORS Error
Pastikan backend mengizinkan origin dari Vercel. Update `server/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### Database tidak persist
- **Railway**: Otomatis persist dengan volume
- **Render**: Gunakan persistent disk atau external database
- **Vercel**: Tidak support SQLite, harus pakai PostgreSQL

### Build Error
```bash
# Pastikan semua dependencies terinstall
npm install

# Test build lokal
npm run build
```

### API tidak bisa diakses
1. Check backend URL di Vercel environment variables
2. Check CORS settings di backend
3. Check backend logs di Railway/Render dashboard
4. Test API langsung dengan curl/Postman

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

## 💡 Rekomendasi

**Untuk Production:**
- ✅ Frontend: Vercel (gratis, cepat, mudah)
- ✅ Backend: Railway (gratis tier, support SQLite, persistent storage)
- ✅ Database: SQLite (cukup untuk small-medium apps) atau PostgreSQL untuk scale

**Untuk Development:**
- Local development dengan SQLite tetap bisa digunakan
- Update `VITE_API_BASE_URL` sesuai environment
