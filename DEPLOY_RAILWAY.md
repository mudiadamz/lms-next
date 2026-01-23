# Deploy Backend ke Railway

Railway adalah platform yang sangat cocok untuk deploy backend dengan SQLite karena mendukung persistent storage.

## Setup

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login ke Railway

```bash
railway login
```

### 3. Initialize Project

```bash
cd server
railway init
```

Pilih:
- Create new project
- Beri nama: `lms-backend`

### 4. Set Environment Variables

```bash
railway variables set JWT_SECRET=your-very-long-secret-key-min-32-chars
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

Atau set di Railway Dashboard:
- Project → Variables → Add Variable

### 5. Deploy

```bash
railway up
```

### 6. Get URL

```bash
railway domain
```

Atau lihat di Railway Dashboard → Settings → Networking

## Setup Database

Railway akan otomatis membuat persistent volume untuk database. Tapi kita perlu initialize database setelah deploy pertama kali.

### Option 1: SSH ke Railway dan run migration

```bash
railway shell
npm run migrate
npm run seed
exit
```

### Option 2: Tambahkan startup script

Buat file `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run migrate && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Update Frontend

Setelah backend deployed, update environment variable di Vercel:

```
VITE_API_BASE_URL=https://your-app.up.railway.app/api
```

## Monitoring

- Railway Dashboard → Metrics: Lihat CPU, Memory, Network
- Railway Dashboard → Logs: Lihat application logs
- Railway Dashboard → Settings → Networking: Lihat domain dan ports

## Troubleshooting

### Database tidak ada setelah deploy

Jalankan migration manual:
```bash
railway shell
npm run migrate
npm run seed
```

### Port error

Railway otomatis set PORT via environment variable. Pastikan kode menggunakan `process.env.PORT`.

### Build failed

Pastikan semua dependencies ada di `package.json` dan tidak ada native modules yang tidak didukung.
