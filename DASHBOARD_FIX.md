# Fix: Project Tidak Muncul di Vercel Dashboard

## Kemungkinan Penyebab

1. **Project belum di-deploy** - Hanya linked tapi belum deploy
2. **Deploy gagal** - Ada error saat deploy
3. **Salah team/account** - Login dengan account yang berbeda
4. **Project di team lain** - Project ada di team yang berbeda
5. **Belum connect ke Git** - Project dibuat manual tanpa Git integration

## Solusi

### 1. Check Status Project

```bash
# Check project info
cat .vercel/project.json

# List semua deployments
vercel ls

# Check project details
vercel inspect
```

### 2. Deploy Project

Jika project sudah linked tapi belum deploy:

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

### 3. Check di Dashboard yang Benar

**Vercel Dashboard:**
1. Buka https://vercel.com/dashboard
2. Check **semua teams** yang Anda punya akses
3. Cari project dengan nama yang sama atau check di "All Projects"

**Jika tidak muncul:**
- Project mungkin di team lain
- Atau belum pernah di-deploy

### 4. Connect via Git (Recommended)

**Cara terbaik adalah connect via Git:**

1. **Push code ke GitHub/GitLab/Bitbucket** (jika belum)
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Di Vercel Dashboard:**
   - Klik "Add New Project"
   - Pilih repository `lms`
   - Configure:
     - Framework: Vite
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Deploy

3. **Setelah itu**, setiap push ke Git akan auto-deploy

### 5. Re-link Project

Jika project sudah ada tapi tidak muncul:

```bash
# Remove local link
rm -rf .vercel

# Link lagi
vercel link

# Pilih:
# - Set up and deploy? Yes
# - Which scope? (Pilih account/team)
# - Link to existing project? No (buat baru)
#   atau Yes (link ke existing)
```

### 6. Check Team/Account

```bash
# Check current user
vercel whoami

# List teams
vercel teams ls

# Switch team jika perlu
vercel teams switch
```

## Cara Cek Project di Dashboard

### Via Web Dashboard:

1. **Buka https://vercel.com/dashboard**
2. **Check tabs:**
   - "Overview" - Semua projects
   - "Projects" - List semua projects
   - "Deployments" - Semua deployments
3. **Search** - Gunakan search bar untuk cari project
4. **Filter** - Filter by team, framework, dll

### Via CLI:

```bash
# List semua projects
vercel projects ls

# List deployments untuk project ini
vercel ls

# Get project info
vercel inspect
```

## Troubleshooting

### Project ada tapi tidak muncul di list

**Kemungkinan:**
- Project di team yang berbeda
- Belum ada deployment
- Filter/search menyembunyikan project

**Solusi:**
```bash
# List semua projects di semua teams
vercel projects ls

# Check project details
vercel inspect [project-name]
```

### "Project not found"

**Kemungkinan:**
- Project dihapus
- Tidak punya akses
- Salah team

**Solusi:**
```bash
# Re-link project
vercel link

# Atau buat project baru
vercel --prod
```

### Deploy berhasil tapi tidak muncul

**Kemungkinan:**
- Deploy ke preview, bukan production
- Deploy ke team yang berbeda
- Cache browser

**Solusi:**
```bash
# Check deployments
vercel ls

# Deploy production
vercel --prod

# Clear cache browser dan refresh dashboard
```

## Quick Fix

**Cara tercepat:**

1. **Buka Vercel Dashboard** di browser
2. **Klik "Add New Project"**
3. **Import dari Git** (jika repo sudah di GitHub/GitLab)
4. **Atau Deploy via CLI:**
   ```bash
   vercel --prod
   ```
5. **Copy URL** yang diberikan dan buka di browser
6. **Check Dashboard** - Project akan muncul setelah deploy pertama

## Setelah Project Muncul

1. **Set Environment Variables:**
   - Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL`

2. **Enable Auto-Deploy:**
   - Settings → Git
   - Connect repository jika belum

3. **Check Deployments:**
   - Dashboard → Deployments
   - Lihat semua deployment history
