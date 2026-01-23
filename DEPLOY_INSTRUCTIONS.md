# Deploy Instructions untuk Vercel

## Error yang Mungkin Terjadi

Jika terjadi error `ENOTFOUND api.vercel.com`, kemungkinan:
1. Belum login ke Vercel
2. Masalah koneksi internet/DNS
3. Firewall memblokir akses

## Solusi

### 1. Login ke Vercel

```bash
vercel login
```

Ini akan membuka browser untuk autentikasi.

### 2. Deploy via Vercel Dashboard (Alternatif)

Jika CLI tidak bekerja:

1. Buka https://vercel.com
2. Login dengan GitHub/GitLab/Bitbucket
3. Klik "Add New Project"
4. Import repository ini
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `./` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: URL backend Anda (misalnya `https://your-backend.railway.app/api`)
7. Deploy!

### 3. Deploy via CLI (Setelah Login)

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

### 4. Set Environment Variables via CLI

```bash
vercel env add VITE_API_BASE_URL
# Masukkan URL backend saat diminta
```

Atau via Dashboard:
- Project → Settings → Environment Variables → Add

## Troubleshooting

### Build Error
```bash
# Test build lokal dulu
npm run build

# Jika berhasil, deploy
vercel --prod
```

### CORS Error di Production
Pastikan backend mengizinkan origin dari Vercel:
- Update CORS di `server/src/index.ts` untuk include Vercel domain

### Environment Variables Tidak Terbaca
- Pastikan nama variable dimulai dengan `VITE_` untuk Vite
- Redeploy setelah menambah environment variable

## Quick Deploy Checklist

- [ ] Login ke Vercel (`vercel login`)
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Deploy (`vercel --prod`)
- [ ] Set environment variable `VITE_API_BASE_URL`
- [ ] Redeploy jika perlu
- [ ] Test di production URL
