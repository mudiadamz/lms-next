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
  console.log('🌱 Seeding database...');

  // Create default password hash
  const defaultPassword = await hashPassword('password');
  console.log('✅ Password hash created');

  // Insert Academic Year
  const academicYearId = uuid();
  try {
    db.prepare(`
      INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(academicYearId, '2024/2025', '2024-07-01', '2025-06-30', 1);
    console.log('✅ Academic year created');
  } catch (error) {
    console.log('⚠️  Academic year already exists or error:', error);
  }

  // Insert Users - Check if they exist first
  let studentId = uuid();
  let teacherId = uuid();
  const adminId = uuid();
  const parentId = uuid();

  // Check if users already exist
  const existingStudent = db.prepare('SELECT id FROM users WHERE username = ?').get('student') as any;
  const existingTeacher = db.prepare('SELECT id FROM users WHERE username = ?').get('teacher') as any;
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as any;
  const existingParent = db.prepare('SELECT id FROM users WHERE username = ?').get('parent') as any;

  // Insert Student
  if (!existingStudent) {
    try {
      db.prepare(`
        INSERT INTO users (id, student_number, username, password, full_name, email, role, school_level, class_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(studentId, '2024001', 'student', defaultPassword, 'Budi Santoso', 'student@example.com', 'student', 'sma', null);
      console.log('✅ Student user created: student / password');
    } catch (error) {
      console.error('❌ Error creating student:', error);
    }
  } else {
    console.log('ℹ️  Student user already exists');
    // Use existing student ID for parent
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('student') as any;
    if (existing) studentId = existing.id;
  }

  // Insert Teacher
  if (!existingTeacher) {
    try {
      db.prepare(`
        INSERT INTO users (id, teacher_number, username, password, full_name, email, role, school_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(teacherId, '1985001', 'teacher', defaultPassword, 'Ibu Siti', 'teacher@example.com', 'teacher', 'sma');
      console.log('✅ Teacher user created: teacher / password');
    } catch (error) {
      console.error('❌ Error creating teacher:', error);
    }
  } else {
    console.log('ℹ️  Teacher user already exists');
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('teacher') as any;
    if (existing) teacherId = existing.id;
  }

  // Insert Admin
  if (!existingAdmin) {
    try {
      db.prepare(`
        INSERT INTO users (id, admin_number, username, password, full_name, email, role, school_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(adminId, 'ADM001', 'admin', defaultPassword, 'Admin Sekolah', 'admin@example.com', 'admin', 'sma');
      console.log('✅ Admin user created: admin / password');
    } catch (error) {
      console.error('❌ Error creating admin:', error);
    }
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Insert Parent (needs studentId)
  if (!existingParent) {
    try {
      // Get student ID if not set
      let finalStudentId = studentId;
      if (existingStudent) {
        const student = db.prepare('SELECT id FROM users WHERE username = ?').get('student') as any;
        if (student) finalStudentId = student.id;
      }
      
      db.prepare(`
        INSERT INTO users (id, username, password, full_name, email, role, student_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(parentId, 'parent', defaultPassword, 'Bapak Santoso', 'parent@example.com', 'parent', finalStudentId);
      console.log('✅ Parent user created: parent / password');
    } catch (error) {
      console.error('❌ Error creating parent:', error);
    }
  } else {
    console.log('ℹ️  Parent user already exists');
  }

  // Get teacher ID (use existing or new)
  let finalTeacherId = teacherId;
  if (existingTeacher) {
    const teacher = db.prepare('SELECT id FROM users WHERE username = ?').get('teacher') as any;
    if (teacher) finalTeacherId = teacher.id;
  }

  // Insert Class
  let classId = uuid();
  try {
    db.prepare(`
      INSERT OR IGNORE INTO classes (id, name, grade, school_level, homeroom_teacher_id, academic_year, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(classId, 'X IPA 1', 10, 'sma', finalTeacherId, academicYearId, 1);
    console.log('✅ Class created: X IPA 1');
  } catch (error) {
    console.log('⚠️  Class already exists or error:', error);
    // Get existing class
    const existingClass = db.prepare('SELECT id FROM classes WHERE name = ?').get('X IPA 1') as any;
    if (existingClass) {
      classId = existingClass.id;
    }
  }

  // Update student with class_id
  let finalStudentId = studentId;
  if (existingStudent) {
    const student = db.prepare('SELECT id FROM users WHERE username = ?').get('student') as any;
    if (student) finalStudentId = student.id;
  }
  
  try {
    db.prepare(`UPDATE users SET class_id = ? WHERE id = ?`).run(classId, finalStudentId);
    console.log('✅ Student assigned to class');
  } catch (error) {
    console.log('⚠️  Error assigning student to class:', error);
  }

  // Insert Subject
  let subjectId = uuid();
  try {
    db.prepare(`
      INSERT OR IGNORE INTO subjects (id, name, code, description, school_level, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(subjectId, 'Matematika', 'MAT', 'Mata Pelajaran Matematika', 'sma', finalTeacherId);
    console.log('✅ Subject created: Matematika');
  } catch (error) {
    console.log('⚠️  Subject already exists or error:', error);
    const existingSubject = db.prepare('SELECT id FROM subjects WHERE code = ?').get('MAT') as any;
    if (existingSubject) {
      subjectId = existingSubject.id;
    }
  }

  // Link class and subject
  try {
    db.prepare(`
      INSERT OR IGNORE INTO class_subjects (class_id, subject_id)
      VALUES (?, ?)
    `).run(classId, subjectId);
    console.log('✅ Class-Subject linked');
  } catch (error) {
    console.log('⚠️  Class-Subject link already exists');
  }

  // Link student to class
  try {
    db.prepare(`
      INSERT OR IGNORE INTO class_students (class_id, student_id)
      VALUES (?, ?)
    `).run(classId, finalStudentId);
    console.log('✅ Student-Class linked');
  } catch (error) {
    console.log('⚠️  Student-Class link already exists');
  }

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Default Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Student:');
  console.log('   Username: student');
  console.log('   Password: password');
  console.log('');
  console.log('👨‍🏫 Teacher:');
  console.log('   Username: teacher');
  console.log('   Password: password');
  console.log('');
  console.log('👑 Admin:');
  console.log('   Username: admin');
  console.log('   Password: password');
  console.log('');
  console.log('👨‍👩 Parent:');
  console.log('   Username: parent');
  console.log('   Password: password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch(console.error);
