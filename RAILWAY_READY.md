# ✅ Railway Deployment - READY TO DEPLOY

## Status: Semua Sudah Disiapkan! 🎉

### ✅ Pre-Deployment Fixes Applied

1. **✅ TypeScript & tsx di dependencies**
   - `typescript` dan `tsx` sudah dipindahkan ke `dependencies` (bukan devDependencies)
   - Diperlukan untuk Railway build dan migrate

2. **✅ Build script menggunakan npx**
   - `"build": "npx tsc"` - akan bekerja di semua environment

3. **✅ Railway configuration**
   - `railway.json` sudah dikonfigurasi dengan benar
   - Start command: `npm run migrate && npm start`

4. **✅ Dockerfile updated**
   - Menggunakan `npm ci` (bukan `--only=production`)
   - Akan install semua dependencies termasuk TypeScript

5. **✅ Build lokal berhasil**
   - TypeScript compilation berhasil
   - File di `dist/` sudah dibuat

## 🚀 Deploy Sekarang

### Quick Deploy (Setelah Koneksi Normal)

```bash
cd server

# 1. Login
railway login

# 2. Initialize (first time)
railway init
# Pilih: Create new project → Name: lms-backend

# 3. Set environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production

# 4. Deploy
railway up

# 5. Get URL
railway domain
```

### Atau Gunakan Script

```bash
cd server
./deploy-railway.sh
```

## 📋 Checklist Sebelum Deploy

- [x] ✅ `tsx` di dependencies
- [x] ✅ `typescript` di dependencies  
- [x] ✅ Build script menggunakan `npx tsc`
- [x] ✅ `railway.json` dikonfigurasi
- [x] ✅ Build lokal berhasil
- [x] ✅ Dependencies terinstall
- [ ] ⏳ Login ke Railway (setelah koneksi normal)
- [ ] ⏳ Initialize project
- [ ] ⏳ Set environment variables
- [ ] ⏳ Deploy
- [ ] ⏳ Test API

## 🧪 Testing After Deploy

### 1. Health Check

```bash
RAILWAY_URL="https://your-app.up.railway.app"
curl $RAILWAY_URL/health
```

Expected: `{"success":true,"message":"Server is running"}`

### 2. Test Login

```bash
curl -X POST $RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password"}'
```

Expected: JSON dengan user data dan token

### 3. Test Authenticated Endpoint

```bash
TOKEN="your-token-from-login"
curl -H "Authorization: Bearer $TOKEN" \
  $RAILWAY_URL/api/users
```

## 🔧 Troubleshooting Guide

Lihat `server/TEST_DEPLOY.md` untuk troubleshooting lengkap.

### Common Issues:

1. **Build failed - tsx not found**
   - ✅ Fixed: tsx sudah di dependencies

2. **Build failed - tsc not found**
   - ✅ Fixed: typescript sudah di dependencies, build menggunakan npx

3. **Database not found**
   - Fix: Database akan auto-initialize via migrate di startCommand
   - Manual: `railway shell → npm run migrate → npm run seed`

4. **Port error**
   - ✅ Fixed: Kode menggunakan `process.env.PORT`

5. **CORS error**
   - Fix: Set `FRONTEND_URL` di Railway variables

## 📚 Documentation Files

- `server/RAILWAY_DEPLOY.md` - Panduan lengkap deploy
- `server/DEPLOY_NOW.md` - Quick reference
- `server/TEST_DEPLOY.md` - Testing & troubleshooting
- `server/deploy-railway.sh` - Deploy script

## 🎯 Next Steps

1. **Setelah koneksi normal**, jalankan deploy commands di atas
2. **Copy Railway URL** setelah deploy
3. **Update frontend** `VITE_API_BASE_URL` di Vercel
4. **Redeploy frontend**
5. **Test full application**

## ✅ All Set!

Semua konfigurasi sudah benar dan siap untuk deploy. Tinggal tunggu koneksi normal dan jalankan deploy commands!
