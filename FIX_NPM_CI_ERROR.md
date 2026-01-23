# Fix: npm ci Error di Vercel

## Error yang Terjadi

```
code EUSAGE
The `npm ci` command can only install with an existing package-lock.json
```

## Penyebab

Vercel menggunakan `npm ci` untuk clean install, yang memerlukan `package-lock.json`. Error ini terjadi jika:
1. `package-lock.json` tidak ada di repository
2. `package-lock.json` tidak di-commit ke Git
3. `package-lock.json` versi lama (lockfileVersion < 1)

## Solusi

### 1. Generate package-lock.json

**Untuk Frontend (root):**
```bash
npm install --package-lock-only
```

**Untuk Backend (server):**
```bash
cd server
npm install --package-lock-only
```

### 2. Commit package-lock.json

```bash
git add package-lock.json
git add server/package-lock.json
git commit -m "Add package-lock.json for Vercel deployment"
git push
```

### 3. Redeploy di Vercel

Setelah push, Vercel akan otomatis redeploy. Atau manual:
- Vercel Dashboard → Deployments → Redeploy

## Verifikasi

### Check package-lock.json ada:

```bash
# Frontend
ls -la package-lock.json

# Backend
ls -la server/package-lock.json
```

### Check di Git:

```bash
git ls-files | grep package-lock.json
```

Harus muncul:
- `package-lock.json`
- `server/package-lock.json`

## Troubleshooting

### package-lock.json di .gitignore

Jika `package-lock.json` ada di `.gitignore`, hapus:

```bash
# Check .gitignore
grep -n "package-lock.json" .gitignore

# Jika ada, hapus baris tersebut
```

### LockfileVersion Error

Jika masih error tentang lockfileVersion:

```bash
# Update npm
npm install -g npm@latest

# Regenerate package-lock.json
rm package-lock.json
npm install
```

### Vercel masih error

1. **Check Build Logs** di Vercel Dashboard
2. **Clear Build Cache**:
   - Settings → General → Clear Build Cache
   - Redeploy
3. **Check Node Version**:
   - Settings → General → Node.js Version
   - Set ke versi yang sama dengan lokal (misalnya 18.x)

## Prevention

Untuk mencegah error ini:

1. **Selalu commit package-lock.json** ke Git
2. **Jangan add package-lock.json ke .gitignore**
3. **Gunakan npm install** (bukan yarn/pnpm) untuk consistency
4. **Update package-lock.json** setelah update dependencies

## Quick Fix

```bash
# Generate semua package-lock.json
npm install --package-lock-only
cd server && npm install --package-lock-only && cd ..

# Commit
git add package-lock.json server/package-lock.json
git commit -m "Fix: Add package-lock.json for deployment"
git push

# Vercel akan auto-redeploy
```
