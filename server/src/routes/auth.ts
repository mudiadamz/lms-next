import express from 'express';
import db from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    // Find user by username
    const user = db.prepare(`
      SELECT id, username, password, full_name, email, role, school_level, class_id, student_id,
             student_number, teacher_number, admin_number, avatar, phone_number, birth_place,
             birth_date, kk_file, ktp_file, photo_file, address, created_at, updated_at
      FROM users
      WHERE username = ?
    `).get(username) as any;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  // JWT is stateless, so logout is handled client-side
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
