# Fix: Project Tidak Muncul di Dashboard

## Status Project Anda

Project sudah di-link ke Vercel:
- **Project ID**: `prj_2FtHkTaLbpMdYZCXoLai0q0OvniU`
- **Team ID**: `team_jYTplfVWoTuEheyzhgZD7qf4`
- **Project Name**: `lms`

## Masalah: Project Tidak Muncul di Dashboard

**Kemungkinan penyebab:**
1. ✅ Project sudah di-link tapi **belum pernah di-deploy**
2. Deploy gagal karena masalah koneksi (ENOTFOUND api.vercel.com)
3. Project ada di team yang berbeda dari yang sedang dilihat

## Solusi

### Opsi 1: Deploy via Vercel Dashboard (Paling Mudah)

Karena ada masalah koneksi dengan CLI, gunakan Dashboard:

1. **Buka https://vercel.com/dashboard**
2. **Login** dengan account yang sama
3. **Cari project "lms"** di dashboard:
   - Check di semua teams
   - Gunakan search bar
   - Check di "All Projects"
4. **Jika tidak muncul**, klik **"Add New Project"**:
   - Pilih **"Import Git Repository"**
   - Pilih repository `lms` (jika sudah di GitHub/GitLab)
   - Atau pilih **"Deploy from local"** → Upload folder
5. **Configure**:
   - Framework: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Deploy!**

### Opsi 2: Connect via Git (Recommended)

**Jika repository sudah di GitHub/GitLab:**

1. **Push code ke Git** (jika belum):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Di Vercel Dashboard**:
   - Klik "Add New Project"
   - Import dari Git repository
   - Vercel akan auto-detect Vite
   - Deploy

3. **Setelah itu**, setiap push akan auto-deploy

### Opsi 3: Fix Koneksi & Deploy via CLI

**Setelah koneksi internet kembali normal:**

```bash
# 1. Check login
vercel whoami

# 2. Deploy preview
vercel

# 3. Deploy production
vercel --prod
```

## Cara Cek Project di Dashboard

### Langkah-langkah:

1. **Buka https://vercel.com/dashboard**
2. **Check di tempat berikut:**
   - **Overview tab** - Semua projects
   - **Projects tab** - List projects
   - **Search bar** - Cari "lms"
   - **Team selector** - Check semua teams yang Anda punya akses

3. **Jika tidak muncul:**
   - Project mungkin belum pernah di-deploy
   - Atau ada di team yang berbeda

### Via Direct URL:

Coba akses langsung:
```
https://vercel.com/[your-username]/lms
atau
https://vercel.com/team/[team-name]/lms
```

## Quick Fix: Deploy Sekarang

**Cara tercepat untuk membuat project muncul:**

### Via Dashboard:

1. Buka https://vercel.com/dashboard
2. Klik **"Add New Project"**
3. Pilih:
   - **"Import Git Repository"** (jika repo sudah di Git)
   - Atau **"Deploy from local"** (upload folder)
4. Configure dan deploy

### Via CLI (setelah koneksi normal):

```bash
# Deploy production langsung
vercel --prod

# Atau gunakan script
./deploy.sh --prod
```

## Setelah Deploy Berhasil

1. **Project akan muncul di Dashboard**
2. **Set Environment Variables**:
   - Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
3. **Redeploy** setelah set env vars
4. **Test** di production URL

## Troubleshooting

### "Project not found" di Dashboard

**Solusi:**
- Project belum pernah di-deploy
- Deploy dulu: `vercel --prod` atau via Dashboard

### Project ada tapi tidak ada deployments

**Solusi:**
- Deploy pertama kali:
  ```bash
  vercel --prod
  ```

### Project di team yang berbeda

**Solusi:**
```bash
# List teams
vercel teams ls

# Switch team
vercel teams switch

# List projects di team tersebut
vercel projects ls
```

## Summary

**Project Anda sudah di-link tapi belum di-deploy.**

**Untuk membuat project muncul di dashboard:**
1. ✅ Deploy via Dashboard (paling mudah saat ini)
2. ✅ Atau deploy via CLI setelah koneksi normal
3. ✅ Setelah deploy pertama, project akan muncul

**Setelah muncul:**
- Set environment variables
- Connect Git untuk auto-deploy
- Test di production URL
