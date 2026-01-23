# Deploy ke Vercel

Ada beberapa cara untuk deploy LMS ke Vercel. Pilih salah satu yang sesuai:

## Opsi 1: Frontend di Vercel + Backend di Platform Lain (Recommended)

Ini adalah cara termudah dan paling stabil.

### Frontend di Vercel

1. **Setup Vercel Project**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables di Vercel Dashboard**
   - Masuk ke Vercel Dashboard → Project → Settings → Environment Variables
   - Tambahkan:
     ```
     VITE_API_BASE_URL=https://your-backend-url.com/api
     ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Backend di Platform Lain

**Option A: Railway (Recommended untuk SQLite)**
```bash
cd server
railway login
railway init
railway up
```

**Option B: Render**
- Buat Web Service di Render
- Connect ke GitHub repo
- Set build command: `cd server && npm install && npm run build`
- Set start command: `cd server && npm start`
- Set environment variables

**Option C: Fly.io**
```bash
cd server
fly launch
fly deploy
```

## Opsi 2: Full Stack di Vercel dengan PostgreSQL

Convert backend ke Vercel Serverless Functions dengan Vercel Postgres.

### Setup Vercel Postgres

1. Di Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string

### Convert Backend ke Serverless Functions

Lihat folder `vercel-api/` untuk implementasi serverless functions.

### Deploy

```bash
vercel --prod
```

## Opsi 3: Hybrid - Frontend Vercel + Backend Vercel Functions dengan External DB

Gunakan Vercel Serverless Functions tapi dengan database eksternal (Supabase, PlanetScale, dll).

---

## Quick Start (Opsi 1 - Recommended)

### 1. Deploy Frontend ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set production URL
vercel --prod
```

### 2. Deploy Backend ke Railway

```bash
cd server

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### 3. Update Frontend Environment Variable

Di Vercel Dashboard:
- Settings → Environment Variables
- Add: `VITE_API_BASE_URL=https://your-railway-app.up.railway.app/api`

---

## Environment Variables untuk Production

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (Railway/Render/Fly.io)
```
PORT=3000
JWT_SECRET=your-very-long-secret-key-min-32-chars
DB_PATH=./database/lms.db
NODE_ENV=production
```

---

## Troubleshooting

### CORS Error
Pastikan backend mengizinkan origin dari Vercel:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173']
}));
```

### Database tidak persist
- Railway: Database akan persist otomatis
- Render: Gunakan persistent disk atau external database
- Fly.io: Gunakan volume untuk persistent storage

### Build Error
Pastikan semua dependencies terinstall:
```bash
npm install
npm run build
```
