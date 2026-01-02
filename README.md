# Learning Management System (LMS)

Sistem Manajemen Pembelajaran untuk semua jenis sekolah (SD, SMP, SMA) dengan fitur lengkap untuk siswa, guru, admin, dan orang tua.

## Tech Stack

- **React 18+** dengan TypeScript
- **Vite** sebagai build tool
- **React Router DOM** untuk routing
- **CSS** untuk styling

## Fitur Utama

### 👨‍🎓 Siswa
- Dashboard dengan ringkasan aktivitas
- Materi pembelajaran, tugas, dan kuis
- Nilai dan rapor digital
- Jadwal pelajaran dan absensi
- Forum diskusi dan pesan
- Portofolio tugas

### 👨‍🏫 Guru
- Dashboard dengan statistik kelas
- Manajemen kelas dan materi
- Buat dan kelola tugas & kuis
- Penilaian dan input absensi
- Analitik performa siswa
- Bank soal

### 👨‍💼 Admin
- Dashboard dengan statistik sekolah
- Manajemen user, kelas, dan mata pelajaran
- Manajemen jadwal dan tahun ajaran
- Laporan sekolah
- Pengaturan sistem
- Audit log

### 👨‍👩‍👧 Orang Tua
- Dashboard dengan ringkasan anak
- Monitoring nilai dan absensi
- Lihat tugas dan deadline
- Progress belajar anak
- Komunikasi dengan guru

## Getting Started

### Prerequisites

- Node.js 18+ dan npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Login Credentials (Demo)

- **Siswa**: username: `student`, password: `password`
- **Guru**: username: `teacher`, password: `password`
- **Admin**: username: `admin`, password: `password`
- **Orang Tua**: username: `parent`, password: `password`

## Struktur Proyek

```
src/
├── components/          # Reusable components
│   ├── common/         # Button, Input, Card, Form components
│   └── layout/         # Header, Sidebar, DashboardLayout
├── pages/              # Page components
│   ├── auth/           # Login
│   ├── student/        # 12 halaman siswa
│   ├── teacher/        # 14 halaman guru
│   ├── admin/          # 11 halaman admin
│   └── parent/         # 11 halaman orang tua
├── services/           # API services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/               # TypeScript types
├── contexts/            # React contexts
├── routes/              # Route definitions
└── constants/           # Constants
```

## Development

### Services

Semua API services tersedia di `src/services/`:
- `authService` - Authentication
- `assignmentService` - Tugas
- `quizService` - Kuis
- `materialService` - Materi pembelajaran
- `gradeService` - Nilai
- `attendanceService` - Absensi
- `userService` - User management
- `classService` - Kelas management

### Utilities

Utility functions di `src/utils/`:
- `dateUtils` - Format tanggal Indonesia
- `validation` - Validasi form

### Hooks

Custom hooks di `src/hooks/`:
- `useLocalStorage` - LocalStorage dengan React state
- `useDebounce` - Debounce values
- `useAsync` - Handle async operations

## Next Steps

- [ ] Implementasi API integration (ganti mock data)
- [ ] File upload/download functionality
- [ ] Form handling untuk create/edit
- [ ] Data visualization (charts)
- [ ] Real-time notifications
- [ ] Unit tests
- [ ] E2E tests

## License

MIT
