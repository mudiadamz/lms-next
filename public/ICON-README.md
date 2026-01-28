# PWA Icons Required

Untuk PWA bekerja dengan sempurna, Anda perlu menambahkan icon berikut di folder `public/`:

## Required Icons:

1. **icon-192.png** (192x192 pixels)
   - Icon untuk Android home screen
   - Recommended: Logo sekolah atau "LMS" text

2. **icon-512.png** (512x512 pixels)
   - Icon untuk splash screen
   - Recommended: Logo sekolah atau "LMS" text dengan background

## Quick Generate Icons:

Anda bisa:
1. Gunakan logo sekolah yang ada
2. Generate online di: https://realfavicongenerator.net/
3. Upload 1 image → Download semua size

## Temporary Solution:

Jika belum ada icon, copy file `vite.svg` sebagai placeholder:
```bash
copy vite.svg icon-192.png
copy vite.svg icon-512.png
```

Atau gunakan tool untuk generate dari text "LMS".
