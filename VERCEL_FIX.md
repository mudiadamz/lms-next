# Fix untuk Vercel Deploy Error

## Error yang Terjadi

```
Error: An unexpected error occurred in deploy: FetchError: request to https://api.vercel.com/... failed, reason: getaddrinfo ENOTFOUND api.vercel.com
```

## Penyebab

1. **Masalah koneksi internet/DNS** - Tidak bisa resolve `api.vercel.com`
2. **Belum login** - Vercel CLI perlu autentikasi
3. **Firewall/Proxy** - Memblokir akses ke Vercel API

## Solusi

### Opsi 1: Deploy via Vercel Dashboard (Paling Mudah)

Jika CLI tidak bekerja karena masalah koneksi:

1. **Buka https://vercel.com** di browser
2. **Login** dengan GitHub/GitLab/Bitbucket
3. **Klik "Add New Project"**
4. **Import Repository**:
   - Connect GitHub/GitLab/Bitbucket jika belum
   - Pilih repository `lms`
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **Environment Variables**:
   - Klik "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
   - (Backend URL bisa ditambahkan nanti setelah deploy backend)
7. **Deploy!**

### Opsi 2: Fix Koneksi & Deploy via CLI

#### Step 1: Check Koneksi

```bash
# Test koneksi
ping api.vercel.com

# Atau
curl -I https://api.vercel.com
```

Jika tidak bisa connect:
- Check internet connection
- Check DNS settings
- Check firewall/proxy settings
- Try using different network

#### Step 2: Login

```bash
vercel login
```

Ini akan membuka browser untuk autentikasi.

#### Step 3: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Opsi 3: Gunakan Script Deploy

```bash
# Make executable (first time only)
chmod +x deploy.sh

# Deploy preview
./deploy.sh

# Deploy production
./deploy.sh --prod
```

## Konfigurasi yang Sudah Diperbaiki

✅ `vercel.json` - Sudah dikonfigurasi dengan benar
✅ `.vercelignore` - File yang tidak perlu di-deploy sudah di-exclude
✅ Build command - Sudah di-test dan berhasil
✅ Output directory - Sudah benar (`dist`)

## Setelah Deploy Berhasil

1. **Set Environment Variable** di Vercel Dashboard:
   - `VITE_API_BASE_URL` = URL backend Anda

2. **Redeploy** setelah set environment variable

3. **Test** di production URL:
   - Buka URL yang diberikan Vercel
   - Test login dengan credentials default

## Troubleshooting

### Build Error
```bash
# Test build lokal
npm run build

# Jika ada error, fix dulu sebelum deploy
```

### Environment Variables Tidak Terbaca
- Pastikan nama variable dimulai dengan `VITE_`
- Redeploy setelah menambah environment variable
- Check di Vercel Dashboard → Settings → Environment Variables

### CORS Error di Production
Update `server/src/index.ts` untuk include Vercel domain:
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-app.vercel.app', // Tambahkan ini
  process.env.FRONTEND_URL,
];
```

## Next Steps

Setelah frontend deployed:
1. Deploy backend ke Railway/Render (lihat `DEPLOY_RAILWAY.md`)
2. Update `VITE_API_BASE_URL` di Vercel dengan backend URL
3. Redeploy frontend
4. Test full application
