# Fix: Vercel Build Error - npm ci

## Problem

Vercel build gagal dengan error:
```
code EUSAGE
The `npm ci` command can only install with an existing package-lock.json
```

## Root Cause

Vercel menggunakan `npm ci` untuk clean install yang memerlukan `package-lock.json` yang valid dan ter-commit di Git.

## Solution

### ✅ Step 1: Pastikan package-lock.json ada dan up-to-date

**Root (Frontend):**
```bash
npm install --package-lock-only
```

**Server (Backend - untuk Railway):**
```bash
cd server
npm install --package-lock-only
cd ..
```

### ✅ Step 2: Commit package-lock.json

```bash
# Add semua package-lock.json
git add package-lock.json
git add server/package-lock.json

# Commit
git commit -m "Fix: Add package-lock.json for Vercel deployment"

# Push
git push
```

### ✅ Step 3: Vercel akan auto-redeploy

Setelah push, Vercel akan otomatis trigger deployment baru.

Atau manual redeploy:
- Vercel Dashboard → Deployments → Latest → Redeploy

## Verification

### Check package-lock.json di Git:

```bash
git ls-files | grep package-lock.json
```

Harus muncul:
- `package-lock.json` ✅
- `server/package-lock.json` ✅ (optional, untuk Railway)

### Check lockfileVersion:

```bash
head -5 package-lock.json | grep lockfileVersion
```

Harus menunjukkan `lockfileVersion` >= 1.

## Important Notes

1. **Jangan add package-lock.json ke .gitignore**
   - Vercel memerlukan file ini untuk `npm ci`

2. **Gunakan npm (bukan yarn/pnpm)**
   - Vercel default menggunakan npm
   - Consistency penting untuk deployment

3. **Update package-lock.json setelah dependency changes**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Update dependencies"
   ```

## Troubleshooting

### Masih error setelah commit?

1. **Check Vercel Build Logs**:
   - Dashboard → Deployments → Latest → Build Logs
   - Lihat error detail

2. **Clear Build Cache**:
   - Settings → General → Clear Build Cache
   - Redeploy

3. **Check Node Version**:
   - Settings → General → Node.js Version
   - Set ke 18.x atau 20.x (sesuai dengan lokal)

4. **Regenerate package-lock.json**:
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   git push
   ```

### package-lock.json di .gitignore?

Jika ada, hapus dari .gitignore:
```bash
# Check
grep "package-lock" .gitignore

# Edit .gitignore dan hapus baris package-lock.json
```

## Quick Fix Script

```bash
#!/bin/bash
# Fix Vercel npm ci error

echo "🔧 Fixing npm ci error for Vercel..."

# Generate/update package-lock.json
echo "📦 Generating package-lock.json..."
npm install --package-lock-only

# Check if server folder exists
if [ -d "server" ]; then
    echo "📦 Generating server/package-lock.json..."
    cd server
    npm install --package-lock-only
    cd ..
fi

# Check if package-lock.json exists
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
    
    # Check lockfileVersion
    if grep -q '"lockfileVersion": [1-9]' package-lock.json; then
        echo "✅ lockfileVersion is valid"
    else
        echo "⚠️  lockfileVersion might be invalid"
    fi
else
    echo "❌ package-lock.json not found!"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "   1. git add package-lock.json server/package-lock.json"
echo "   2. git commit -m 'Fix: Add package-lock.json'"
echo "   3. git push"
echo "   4. Vercel will auto-redeploy"
```

## After Fix

Setelah fix dan deploy berhasil:

1. ✅ Build akan berhasil di Vercel
2. ✅ Project akan muncul di Dashboard
3. ✅ Deployment akan complete

## Prevention

Untuk mencegah error ini di masa depan:

1. ✅ **Selalu commit package-lock.json**
2. ✅ **Jangan add ke .gitignore**
3. ✅ **Update setelah npm install/update**
4. ✅ **Gunakan npm (bukan yarn/pnpm) untuk consistency**
