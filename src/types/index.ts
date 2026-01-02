// User Types
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';
export type SchoolLevel = 'sd' | 'smp' | 'sma';

export interface User {
  id: string;
  studentNumber?: string; // Nomor Induk Siswa (NIS)
  teacherNumber?: string; // Nomor Induk Pengajar (NIP)
  adminNumber?: string; // Nomor Induk Admin
  fullName: string;
  role: UserRole;
  schoolLevel?: SchoolLevel;
  classId?: string;
  studentId?: string; // For parent role
  avatar?: string;
  phoneNumber?: string;
  birthPlace?: string;
  birthDate?: string;
  kkFile?: string; // File name or URL
  ktpFile?: string; // File name or URL
  photoFile?: string; // File name or URL
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  grade: number;
  schoolLevel: SchoolLevel;
  homeroomTeacherId: string;
  studentIds: string[];
  subjectIds: string[];
  academicYear: string;
  semester: number;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  schoolLevel: SchoolLevel;
  teacherId: string;
  classIds: string[];
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: Date;
  attachments?: string[];
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: string[];
  score?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
}

// Quiz Types
export type QuestionType = 'multiple_choice' | 'essay' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  startDate: Date;
  endDate: Date;
  maxScore: number;
  createdAt: Date;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string | string[]>;
  score?: number;
  submittedAt: Date;
  gradedAt?: Date;
}

// Material Types
export type MaterialType = 'video' | 'document' | 'presentation' | 'link' | 'other';

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  subjectId: string;
  classId: string;
  teacherId: string;
  fileUrl?: string;
  externalUrl?: string;
  attachments?: string[];
  createdAt: Date;
}

// Grade Types
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  assignmentId?: string;
  quizId?: string;
  score: number;
  maxScore: number;
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'other';
  teacherId: string;
  notes?: string;
  createdAt: Date;
}

export interface ReportCard {
  id: string;
  studentId: string;
  classId: string;
  academicYear: string;
  semester: number;
  grades: Grade[];
  averageScore: number;
  rank?: number;
  teacherNotes?: string;
  createdAt: Date;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string; // teacherId
  createdAt: Date;
}

// Schedule Types
export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  room?: string;
  academicYear: string;
  semester: number;
}

// Forum Types
export interface ForumPost {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  attachments?: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: Date;
}

// Notification Types
export type NotificationType = 'assignment' | 'quiz' | 'grade' | 'announcement' | 'message' | 'attendance' | 'other';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience: UserRole[] | 'all';
  classId?: string;
  attachments?: string[];
  isPinned: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

// Academic Year Types
export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

