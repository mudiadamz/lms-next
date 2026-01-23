import express from 'express';
import db from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    // Trim username to handle any whitespace issues (keep original case)
    const trimmedUsername = username.trim();

    // Find user by username (exact match first, then case-insensitive)
    let user = db.prepare(`
      SELECT id, username, password, full_name, email, role, school_level, class_id, student_id,
             student_number, teacher_number, admin_number, avatar, phone_number, birth_place,
             birth_date, kk_file, ktp_file, photo_file, address, created_at, updated_at
      FROM users
      WHERE username = ?
    `).get(trimmedUsername) as any;

    // If not found, try case-insensitive
    if (!user) {
      user = db.prepare(`
        SELECT id, username, password, full_name, email, role, school_level, class_id, student_id,
               student_number, teacher_number, admin_number, avatar, phone_number, birth_place,
               birth_date, kk_file, ktp_file, photo_file, address, created_at, updated_at
        FROM users
        WHERE LOWER(TRIM(username)) = LOWER(?)
      `).get(trimmedUsername) as any;
    }

    if (!user) {
      console.log('❌ User not found after all attempts');
      console.log('   Searched for:', trimmedUsername);
      console.log('   Original input:', username);
      
      // List available users with details for debugging
      const allUsers = db.prepare('SELECT username, LENGTH(username) as len FROM users LIMIT 10').all() as any[];
      console.log('📋 Available users in database:');
      allUsers.forEach(u => {
        console.log(`   - "${u.username}" (length: ${u.len})`);
      });
      
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    console.log('✅ User found:', user.username, 'Role:', user.role);
    console.log('🔍 Password hash check:', {
      hashLength: user.password?.length,
      hashStart: user.password?.substring(0, 10),
      isBcrypt: user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')
    });

    // Verify password
    if (!user.password) {
      console.log('❌ User has no password set');
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    console.log('✅ Login successful for:', user.username);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    // Convert dates
    user.createdAt = new Date(user.created_at);
    user.updatedAt = new Date(user.updated_at);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          studentNumber: user.student_number,
          teacherNumber: user.teacher_number,
          adminNumber: user.admin_number,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          schoolLevel: user.school_level,
          classId: user.class_id,
          studentId: user.student_id,
          avatar: user.avatar,
          phoneNumber: user.phone_number,
          birthPlace: user.birth_place,
          birthDate: user.birth_date,
          kkFile: user.kk_file,
          ktpFile: user.ktp_file,
          photoFile: user.photo_file,
          address: user.address,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

router.post('/logout', (req, res) => {
  // JWT is stateless, so logout is handled client-side
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
