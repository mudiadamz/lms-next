import db from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Note: Install bcryptjs: npm install bcryptjs
// Note: Install @types/bcryptjs: npm install --save-dev @types/bcryptjs

// Helper function to generate UUID
function uuid() {
  return crypto.randomUUID();
}

// Hash password helper
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  console.log('Seeding database...');

  // Create default password hash
  const defaultPassword = await hashPassword('password');

  // Insert Academic Year
  const academicYearId = uuid();
  db.prepare(`
    INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(academicYearId, '2024/2025', '2024-07-01', '2025-06-30', 1);

  // Insert Users
  const studentId = uuid();
  const teacherId = uuid();
  const adminId = uuid();
  const parentId = uuid();

  db.prepare(`
    INSERT OR IGNORE INTO users (id, student_number, username, password, full_name, email, role, school_level, class_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(studentId, '2024001', 'student', defaultPassword, 'Budi Santoso', 'student@example.com', 'student', 'sma', null);

  db.prepare(`
    INSERT OR IGNORE INTO users (id, teacher_number, username, password, full_name, email, role, school_level, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(teacherId, '1985001', 'teacher', defaultPassword, 'Ibu Siti', 'teacher@example.com', 'teacher', 'sma');

  db.prepare(`
    INSERT OR IGNORE INTO users (id, admin_number, username, password, full_name, email, role, school_level, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(adminId, 'ADM001', 'admin', defaultPassword, 'Admin Sekolah', 'admin@example.com', 'admin', 'sma');

  db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password, full_name, email, role, student_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(parentId, 'parent', defaultPassword, 'Bapak Santoso', 'parent@example.com', 'parent', studentId);

  // Insert Class
  const classId = uuid();
  db.prepare(`
    INSERT OR IGNORE INTO classes (id, name, grade, school_level, homeroom_teacher_id, academic_year, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(classId, 'X IPA 1', 10, 'sma', teacherId, academicYearId, 1);

  // Update student with class_id
  db.prepare(`UPDATE users SET class_id = ? WHERE id = ?`).run(classId, studentId);

  // Insert Subject
  const subjectId = uuid();
  db.prepare(`
    INSERT OR IGNORE INTO subjects (id, name, code, description, school_level, teacher_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(subjectId, 'Matematika', 'MAT', 'Mata Pelajaran Matematika', 'sma', teacherId);

  // Link class and subject
  db.prepare(`
    INSERT OR IGNORE INTO class_subjects (class_id, subject_id)
    VALUES (?, ?)
  `).run(classId, subjectId);

  // Link student to class
  db.prepare(`
    INSERT OR IGNORE INTO class_students (class_id, student_id)
    VALUES (?, ?)
  `).run(classId, studentId);

  console.log('Database seeded successfully!');
  console.log('Default credentials:');
  console.log('- Student: username=student, password=password');
  console.log('- Teacher: username=teacher, password=password');
  console.log('- Admin: username=admin, password=password');
  console.log('- Parent: username=parent, password=password');
}

seed().catch(console.error);
