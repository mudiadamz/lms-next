import db from './db.js';
import bcrypt from 'bcryptjs';

async function fixPasswords() {
  console.log('🔧 Fixing password hashes...');

  const users = db.prepare('SELECT id, username, password FROM users WHERE username IN (?, ?, ?, ?)').all('student', 'teacher', 'admin', 'parent') as any[];

  if (users.length === 0) {
    console.log('❌ No users found. Run seed script first.');
    return;
  }

  const correctPassword = 'password';
  const hashedPassword = await bcrypt.hash(correctPassword, 10);

  console.log('✅ Generated password hash:', hashedPassword.substring(0, 30) + '...');

  for (const user of users) {
    // Check if password is already a bcrypt hash
    const isBcryptHash = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
    
    if (!isBcryptHash) {
      console.log(`⚠️  User ${user.username} has invalid password hash. Updating...`);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
      console.log(`✅ Updated password for ${user.username}`);
    } else {
      // Verify the hash works
      const isValid = await bcrypt.compare(correctPassword, user.password);
      if (!isValid) {
        console.log(`⚠️  User ${user.username} password hash doesn't match. Updating...`);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
        console.log(`✅ Updated password for ${user.username}`);
      } else {
        console.log(`✅ User ${user.username} password hash is valid`);
      }
    }
  }

  console.log('');
  console.log('✅ Password fix completed!');
  console.log('');
  console.log('Test login with:');
  console.log('- Username: student');
  console.log('- Password: password');
}

fixPasswords().catch(console.error);
