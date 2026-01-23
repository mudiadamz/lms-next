# Checklist: Project Tidak Muncul di Dashboard

## ✅ Status Saat Ini

- [x] Project sudah di-link ke Vercel (`.vercel/project.json` ada)
- [x] Project ID: `prj_2FtHkTaLbpMdYZCXoLai0q0OvniU`
- [x] Build lokal berhasil (`npm run build` ✅)
- [ ] **Belum pernah di-deploy** (ini penyebabnya!)

## 🔍 Cara Cek di Dashboard

### 1. Buka Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2. Check di Tempat Ini:
- [ ] **Overview** tab - Semua projects
- [ ] **Projects** tab - List projects  
- [ ] **Search bar** - Cari "lms"
- [ ] **Team selector** (top right) - Check semua teams
- [ ] **All Projects** view

### 3. Jika Tidak Muncul:
Project belum pernah di-deploy. Deploy dulu!

## 🚀 Solusi: Deploy Project

### Opsi A: Via Dashboard (Paling Mudah)

1. Buka https://vercel.com/dashboard
2. Klik **"Add New Project"**
3. Pilih salah satu:
   - **"Import Git Repository"** (jika repo sudah di GitHub/GitLab)
   - **"Deploy from local"** (upload folder)
4. Configure:
   - Framework: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik **"Deploy"**

### Opsi B: Via CLI (Setelah Koneksi Normal)

```bash
# Deploy production
vercel --prod
```

### Opsi C: Connect Git & Auto-Deploy

1. Push ke GitHub/GitLab:
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push origin main
   ```

2. Di Dashboard → Add New Project → Import dari Git

3. Setelah itu, setiap push akan auto-deploy

## ✅ Setelah Deploy Berhasil

1. [ ] Project muncul di Dashboard
2. [ ] Set Environment Variables:
   - `VITE_API_BASE_URL` = backend URL
3. [ ] Redeploy setelah set env vars
4. [ ] Test di production URL
5. [ ] Connect Git untuk auto-deploy

## 🎯 Quick Action

**Sekarang juga:**
1. Buka https://vercel.com/dashboard
2. Klik "Add New Project"
3. Import dari Git atau Deploy from local
4. Deploy!

**Setelah deploy, project akan muncul di dashboard!** 🎉
