# Learning Management System (LMS)

Sistem Manajemen Pembelajaran untuk semua jenis sekolah (SD, SMP, SMA) dengan React + TypeScript dan Express.js + SQLite.

## Tech Stack

### Frontend
- React 18+ dengan TypeScript
- Vite sebagai build tool
- React Router DOM untuk routing

### Backend
- Express.js
- SQLite dengan better-sqlite3
- JWT untuk authentication
- bcryptjs untuk password hashing

## 🚀 Quick Deploy

### Frontend → Vercel
Lihat [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

**TL;DR:**
```bash
vercel login
vercel --prod
```

### Backend API → Railway
Lihat [QUICK_DEPLOY_API.md](./QUICK_DEPLOY_API.md) atau [server/README_DEPLOY.md](./server/README_DEPLOY.md)

**TL;DR:**
```bash
npm i -g @railway/cli
railway login
cd server
railway init
railway up
railway domain  # Copy URL ini
```

**Setelah deploy:**
1. Copy backend URL dari Railway
2. Set `VITE_API_BASE_URL` di Vercel Dashboard
3. Redeploy frontend
4. Done! 🎉

## Setup

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Setup Backend

1. Copy `.env.example` ke `.env` di folder `server/`:
```bash
cd server
cp .env.example .env
```

2. Edit `.env` dan sesuaikan konfigurasi:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./database/lms.db
NODE_ENV=development
```

3. Initialize database:
```bash
npm run migrate
npm run seed
```

4. Jalankan backend server:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 3. Setup Frontend

1. Pastikan `VITE_API_BASE_URL` di `.env` mengarah ke backend:
```bash
# Buat file .env di root project
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
```

2. Jalankan frontend:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Default Credentials

Setelah menjalankan seed database:

- **Student**: username=`student`, password=`password`
- **Teacher**: username=`teacher`, password=`password`
- **Admin**: username=`admin`, password=`password`
- **Parent**: username=`parent`, password=`password`

## Features

### Student
- Dashboard dengan ringkasan aktivitas
- Daftar mata pelajaran
- Materi pembelajaran
- Tugas dan kuis
- Nilai dan rapor
- Absensi
- Forum diskusi
- Pesan dengan guru

### Teacher
- Dashboard dengan statistik kelas
- Manajemen kelas dan mata pelajaran
- Upload materi pembelajaran
- Buat dan kelola tugas
- Buat dan kelola kuis
- Penilaian tugas dan kuis
- Input absensi
- Forum diskusi

### Admin
- Dashboard dengan statistik sekolah
- Manajemen user (siswa, guru, admin, orang tua)
- Manajemen kelas dan jurusan
- Manajemen mata pelajaran
- Manajemen jadwal pelajaran
- Manajemen tahun ajaran
- Laporan sekolah

### Parent
- Dashboard dengan ringkasan anak
- Lihat nilai dan rapor anak
- Lihat absensi anak
- Lihat tugas dan deadline
- Pesan dengan wali kelas/guru

## Project Structure

```
lms/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── routes/          # Route definitions
│   ├── types/           # TypeScript types
│   └── utils/          # Utility functions
├── server/               # Backend server
│   ├── src/
│   │   ├── database/    # Database setup & schema
│   │   ├── routes/      # API routes
│   │   └── middleware/  # Express middleware
│   └── database/        # SQLite database file
└── README.md
```

## Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd server
npm run dev
```

### Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd server
npm run build
npm start
```

## Database

Database menggunakan SQLite yang disimpan di `server/database/lms.db`. 

Untuk reset database:
```bash
cd server
rm database/lms.db
npm run migrate
npm run seed
```

## API Documentation

Lihat `server/README.md` untuk dokumentasi lengkap API endpoints.

## License

MIT
