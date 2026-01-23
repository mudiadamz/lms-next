import db from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function ensureSeed() {
  console.log('🌱 Ensuring database is seeded...\n');

  // Check if users exist
  const existingUsers = db.prepare('SELECT username FROM users WHERE username IN (?, ?, ?, ?)').all('student', 'teacher', 'admin', 'parent') as any[];

  if (existingUsers.length === 4) {
    console.log('✅ All default users exist');
    
    // Verify passwords are correct
    console.log('\n🔍 Verifying passwords...');
    const testPassword = 'password';
    let allValid = true;

    for (const user of existingUsers) {
      const fullUser = db.prepare('SELECT username, password FROM users WHERE username = ?').get(user.username) as any;
      if (fullUser && fullUser.password) {
        const isValid = await bcrypt.compare(testPassword, fullUser.password);
        const status = isValid ? '✅' : '❌';
        console.log(`   ${status} ${user.username}: ${isValid ? 'Valid' : 'Invalid - needs fix'}`);
        if (!isValid) allValid = false;
      }
    }

    if (allValid) {
      console.log('\n✅ All passwords are valid!');
      return;
    } else {
      console.log('\n⚠️  Some passwords are invalid. Fixing...');
    }
  } else {
    console.log(`⚠️  Only ${existingUsers.length}/4 users found. Seeding...`);
  }

  // Seed users
  console.log('\n📝 Seeding users...');
  const defaultPassword = await bcrypt.hash('password', 10);
  console.log('✅ Password hash created:', defaultPassword.substring(0, 30) + '...\n');

  const users = [
    {
      username: 'student',
      role: 'student',
      fullName: 'Budi Santoso',
      email: 'student@example.com',
      studentNumber: '2024001',
      schoolLevel: 'sma'
    },
    {
      username: 'teacher',
      role: 'teacher',
      fullName: 'Ibu Siti',
      email: 'teacher@example.com',
      teacherNumber: '1985001',
      schoolLevel: 'sma'
    },
    {
      username: 'admin',
      role: 'admin',
      fullName: 'Admin Sekolah',
      email: 'admin@example.com',
      adminNumber: 'ADM001',
      schoolLevel: 'sma'
    },
    {
      username: 'parent',
      role: 'parent',
      fullName: 'Bapak Santoso',
      email: 'parent@example.com'
    }
  ];

  for (const userData of users) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(userData.username) as any;
    
    if (existing) {
      // Update password
      db.prepare('UPDATE users SET password = ? WHERE username = ?').run(defaultPassword, userData.username);
      console.log(`✅ Updated password for ${userData.username}`);
    } else {
      // Insert new user
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO users (id, username, password, full_name, email, role, school_level,
                          student_number, teacher_number, admin_number, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        id,
        userData.username,
        defaultPassword,
        userData.fullName,
        userData.email,
        userData.role,
        userData.schoolLevel || null,
        userData.studentNumber || null,
        userData.teacherNumber || null,
        userData.adminNumber || null
      );
      console.log(`✅ Created user: ${userData.username}`);
    }
  }

  // Verify all users
  console.log('\n🔍 Verifying all users...');
  for (const userData of users) {
    const user = db.prepare('SELECT username, password FROM users WHERE username = ?').get(userData.username) as any;
    if (user) {
      const isValid = await bcrypt.compare('password', user.password);
      const status = isValid ? '✅' : '❌';
      console.log(`   ${status} ${userData.username}: ${isValid ? 'Valid' : 'Invalid'}`);
    }
  }

  console.log('\n✅ Database seeding completed!');
  console.log('\n📋 Default Credentials:');
  console.log('   Username: student | Password: password');
  console.log('   Username: teacher | Password: password');
  console.log('   Username: admin   | Password: password');
  console.log('   Username: parent  | Password: password');
}

ensureSeed().catch(console.error);
