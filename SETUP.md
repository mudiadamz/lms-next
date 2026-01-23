# Setup Guide - LMS dengan SQLite

Panduan lengkap untuk setup Learning Management System dengan SQLite database.

## Prerequisites

- Node.js 18+ dan npm
- Git

## Step-by-Step Setup

### 1. Clone atau Download Project

```bash
git clone <repository-url>
cd lms
```

### 2. Setup Backend

```bash
cd server
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di folder `server/`:

```bash
cd server
cp .env.example .env
```

Edit file `.env`:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
DB_PATH=./database/lms.db
NODE_ENV=development
```

**PENTING**: Ganti `JWT_SECRET` dengan string random yang panjang (minimal 32 karakter) untuk production.

### 4. Initialize Database

Jalankan migration untuk membuat semua tabel:

```bash
cd server
npm run migrate
```

Anda akan melihat pesan: `Database tables created successfully`

### 5. Seed Database (Optional tapi Recommended)

Isi database dengan data awal untuk testing:

```bash
cd server
npm run seed
```

Anda akan melihat pesan:
```
Database seeded successfully!
Default credentials:
- Student: username=student, password=password
- Teacher: username=teacher, password=password
- Admin: username=admin, password=password
- Parent: username=parent, password=password
```

### 6. Start Backend Server

```bash
cd server
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

Anda akan melihat:
```
Server is running on http://localhost:3000
API available at http://localhost:3000/api
```

### 7. Setup Frontend

Buka terminal baru dan kembali ke root project:

```bash
cd ..  # Kembali ke root project
npm install
```

### 8. Setup Frontend Environment

Buat file `.env` di root project:

```bash
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
```

### 9. Start Frontend

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 10. Login

Buka browser dan akses `http://localhost:5173`

Gunakan credentials berikut untuk login:
- **Student**: username=`student`, password=`password`
- **Teacher**: username=`teacher`, password=`password`
- **Admin**: username=`admin`, password=`password`
- **Parent**: username=`parent`, password=`password`

Atau klik tombol quick login di halaman login.

## Troubleshooting

### Database tidak dibuat

Pastikan folder `server/database/` ada dan bisa diakses. Jika tidak ada, buat manual:

```bash
mkdir -p server/database
```

### Port sudah digunakan

Jika port 3000 sudah digunakan, ubah di `server/.env`:

```
PORT=3001
```

Dan update `VITE_API_BASE_URL` di root `.env`:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

### Error "Cannot find module"

Pastikan semua dependencies sudah diinstall:

```bash
# Di root project
npm install

# Di server folder
cd server
npm install
```

### Database locked error

Jika terjadi error database locked, tutup semua koneksi ke database dan coba lagi. Atau hapus file database dan jalankan migrate lagi:

```bash
cd server
rm database/lms.db
npm run migrate
npm run seed
```

## Reset Database

Jika ingin reset database ke kondisi awal:

```bash
cd server
rm database/lms.db
npm run migrate
npm run seed
```

## Production Build

### Build Frontend

```bash
npm run build
```

File akan ada di folder `dist/`

### Build Backend

```bash
cd server
npm run build
```

File akan ada di folder `server/dist/`

### Run Production

```bash
cd server
npm start
```

## File Structure

```
lms/
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services (sudah terhubung ke backend)
│   └── ...
├── server/               # Backend server
│   ├── src/
│   │   ├── database/    # Database setup
│   │   ├── routes/      # API routes
│   │   └── middleware/  # Express middleware
│   └── database/        # SQLite database file (auto-generated)
└── ...
```

## Next Steps

1. ✅ Database sudah terhubung
2. ✅ Backend API sudah berjalan
3. ✅ Frontend sudah terhubung ke backend
4. ✅ Authentication sudah bekerja
5. Mulai develop fitur-fitur lainnya!

## Support

Jika ada masalah, pastikan:
1. Backend server berjalan di port yang benar
2. Frontend environment variable `VITE_API_BASE_URL` sudah benar
3. Database sudah di-migrate dan di-seed
4. Semua dependencies sudah terinstall
