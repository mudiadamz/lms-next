// Route Constants
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_SUBJECTS: '/student/subjects',
  STUDENT_MATERIALS: '/student/materials',
  STUDENT_MATERIAL_DETAIL: '/student/materials/:id',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_ASSIGNMENT_DETAIL: '/student/assignments/:id',
  STUDENT_QUIZZES: '/student/quizzes',
  STUDENT_QUIZ_DETAIL: '/student/quizzes/:id',
  STUDENT_GRADES: '/student/grades',
  STUDENT_SCHEDULE: '/student/schedule',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_FORUM: '/student/forum',
  STUDENT_FORUM_DETAIL: '/student/forum/:id',
  STUDENT_MESSAGES: '/student/messages',
  STUDENT_MESSAGE_CHAT: '/student/messages/:id',
  STUDENT_PORTFOLIO: '/student/portfolio',
  STUDENT_CALENDAR: '/student/calendar',
  
  // Teacher Routes
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CLASSES: '/teacher/classes',
  TEACHER_CLASSES_DETAIL: '/teacher/classes/:id',
  TEACHER_CLASSES_MANAGE: '/teacher/classes/:id/manage',
  TEACHER_MATERIALS: '/teacher/materials',
  TEACHER_MATERIALS_CREATE: '/teacher/materials/create',
  TEACHER_ASSIGNMENTS: '/teacher/assignments',
  TEACHER_ASSIGNMENTS_CREATE: '/teacher/assignments/create',
  TEACHER_ASSIGNMENT_DETAIL: '/teacher/assignments/:id',
  TEACHER_ASSIGNMENT_EDIT: '/teacher/assignments/:id/edit',
  TEACHER_ASSIGNMENT_GRADE: '/teacher/assignments/:assignmentId/submissions/:submissionId/grade',
  TEACHER_QUIZZES: '/teacher/quizzes',
  TEACHER_QUIZZES_CREATE: '/teacher/quizzes/create',
  TEACHER_GRADING: '/teacher/grading',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_FORUM: '/teacher/forum',
  TEACHER_FORUM_DETAIL: '/teacher/forum/:id',
  TEACHER_SCHEDULE: '/teacher/schedule',
  TEACHER_REPORTS: '/teacher/reports',
  TEACHER_REPORTS_DETAIL: '/teacher/reports/:id',
  TEACHER_MESSAGES: '/teacher/messages',
  TEACHER_MESSAGES_CHAT: '/teacher/messages/:id',
  TEACHER_ANNOUNCEMENTS: '/teacher/announcements',
  TEACHER_ANALYTICS: '/teacher/analytics',
  TEACHER_QUESTION_BANK: '/teacher/question-bank',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_CLASSES: '/admin/classes',
  ADMIN_CLASSES_CREATE: '/admin/classes/create',
  ADMIN_CLASSES_EDIT: '/admin/classes/edit/:id',
  ADMIN_CLASSES_DETAIL: '/admin/classes/detail/:id',
  ADMIN_CLASSES_STUDENTS: '/admin/classes/:id/students',
  ADMIN_SUBJECTS: '/admin/subjects',
  ADMIN_SUBJECT_MANAGEMENT: '/admin/subjects/manage',
  ADMIN_SUBJECTS_DETAIL: '/admin/subjects/detail/:id',
  ADMIN_SCHEDULE: '/admin/schedule',
  ADMIN_ACADEMIC_YEAR: '/admin/academic-year',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_CURRICULUM: '/admin/curriculum',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  
  // Parent Routes
  PARENT_DASHBOARD: '/parent/dashboard',
  PARENT_CHILD_PROFILE: '/parent/child-profile',
  PARENT_SCHEDULE: '/parent/schedule',
  PARENT_GRADES: '/parent/grades',
  PARENT_ATTENDANCE: '/parent/attendance',
  PARENT_ASSIGNMENTS: '/parent/assignments',
  PARENT_ASSIGNMENT_DETAIL: '/parent/assignments/:id',
  PARENT_MESSAGES: '/parent/messages',
  PARENT_MESSAGE_CHAT: '/parent/messages/:id',
  PARENT_CALENDAR: '/parent/calendar',
  PARENT_ANNOUNCEMENTS: '/parent/announcements',
  PARENT_PROGRESS: '/parent/progress',
  PARENT_ACTIVITY: '/parent/activity',
  PARENT_MATERIALS: '/parent/materials',
  PARENT_MATERIAL_DETAIL: '/parent/materials/:id',
  PARENT_QUIZZES: '/parent/quizzes',
  PARENT_QUIZ_DETAIL: '/parent/quizzes/:id',
  PARENT_SUBJECTS: '/parent/subjects',
  PARENT_FORUM: '/parent/forum',
  PARENT_FORUM_DETAIL: '/parent/forum/:id',
  PARENT_PORTFOLIO: '/parent/portfolio',
} as const;

// School Level Labels
export const SCHOOL_LEVELS = {
  sd: 'Sekolah Dasar',
  smp: 'Sekolah Menengah Pertama',
  sma: 'Sekolah Menengah Atas',
} as const;

// Role Labels
export const ROLE_LABELS = {
  student: 'Siswa',
  teacher: 'Guru',
  admin: 'Administrator',
  parent: 'Orang Tua',
} as const;

// Attendance Status Labels
export const ATTENDANCE_STATUS_LABELS = {
  present: 'Hadir',
  absent: 'Tidak Hadir',
  late: 'Terlambat',
  excused: 'Izin',
} as const;

// Material Type Labels
export const MATERIAL_TYPE_LABELS = {
  video: 'Video',
  document: 'Dokumen',
  presentation: 'Presentasi',
  link: 'Link',
  other: 'Lainnya',
} as const;

// Question Type Labels
export const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Pilihan Ganda',
  essay: 'Esai',
  true_false: 'Benar/Salah',
  short_answer: 'Jawaban Pendek',
} as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

// Notification Type Labels
export const NOTIFICATION_TYPE_LABELS = {
  assignment: 'Tugas',
  quiz: 'Kuis',
  grade: 'Nilai',
  announcement: 'Pengumuman',
  message: 'Pesan',
  attendance: 'Absensi',
  other: 'Lainnya',
} as const;

