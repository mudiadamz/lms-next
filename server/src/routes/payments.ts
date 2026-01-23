import express from 'express';
import db from '../database/db.js';
import crypto from 'crypto';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get payments
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { classId, status, month, year } = req.query;
    let query = `
      SELECT p.id, p.class_id, p.month, p.year, p.amount, p.due_date,
             p.status, p.payment_method, p.receipt_number, p.notes, p.created_at,
             c.name as class_name
      FROM payments p
      JOIN classes c ON p.class_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (classId) {
      query += ' AND p.class_id = ?';
      params.push(classId);
    }
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }
    
    if (year) {
      query += ' AND p.year = ?';
      params.push(parseInt(year as string));
    }
    
    // Students and parents can only see their own class payments
    if (req.userRole === 'student' || req.userRole === 'parent') {
      const user = db.prepare('SELECT class_id FROM users WHERE id = ?').get(req.userId) as any;
      if (user?.class_id) {
        query += ' AND p.class_id = ?';
        params.push(user.class_id);
      } else {
        // No class assigned, return empty
        return res.json({ success: true, data: [] });
      }
    }
    
    query += ' ORDER BY p.year DESC, p.month DESC, p.created_at DESC';

    const payments = db.prepare(query).all(...params) as any[];

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      classId: payment.class_id,
      className: payment.class_name,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      dueDate: new Date(payment.due_date),
      status: payment.status,
      paymentMethod: payment.payment_method,
      receiptNumber: payment.receipt_number,
      notes: payment.notes,
      createdAt: new Date(payment.created_at),
    }));

    res.json({ success: true, data: formattedPayments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const payment = db.prepare(`
      SELECT p.id, p.class_id, p.month, p.year, p.amount, p.due_date,
             p.status, p.payment_method, p.receipt_number, p.notes, p.created_at,
             c.name as class_name
      FROM payments p
      JOIN classes c ON p.class_id = c.id
      WHERE p.id = ?
    `).get(id) as any;

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Check permissions
    if (req.userRole === 'student' || req.userRole === 'parent') {
      const user = db.prepare('SELECT class_id FROM users WHERE id = ?').get(req.userId) as any;
      if (user?.class_id !== payment.class_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }
    }

    res.json({
      success: true,
      data: {
        id: payment.id,
        classId: payment.class_id,
        className: payment.class_name,
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        dueDate: new Date(payment.due_date),
        status: payment.status,
        paymentMethod: payment.payment_method,
        receiptNumber: payment.receipt_number,
        notes: payment.notes,
        createdAt: new Date(payment.created_at),
      },
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create payment
router.post('/', authenticateToken, requireRole('admin'), (req: AuthRequest, res) => {
  try {
    const { classIds, month, year, amount, dueDate, notes } = req.body;

    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ success: false, error: 'classIds array is required' });
    }

    if (!month || !year || !amount || !dueDate) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    const createdPayments = [];

    for (const classId of classIds) {
      const id = crypto.randomUUID();
      
      // Check if payment already exists for this class/month/year
      const existing = db.prepare(`
        SELECT id FROM payments 
        WHERE class_id = ? AND month = ? AND year = ?
      `).get(classId, month, parseInt(year)) as any;

      if (existing) {
        continue; // Skip if already exists
      }

      db.prepare(`
        INSERT INTO payments (id, class_id, month, year, amount, due_date, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'))
      `).run(
        id,
        classId,
        month,
        parseInt(year),
        parseFloat(amount),
        dueDate,
        notes || null
      );

      const payment = db.prepare(`
        SELECT p.id, p.class_id, p.month, p.year, p.amount, p.due_date,
               p.status, p.payment_method, p.receipt_number, p.notes, p.created_at,
               c.name as class_name
        FROM payments p
        JOIN classes c ON p.class_id = c.id
        WHERE p.id = ?
      `).get(id) as any;

      createdPayments.push({
        id: payment.id,
        classId: payment.class_id,
        className: payment.class_name,
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        dueDate: new Date(payment.due_date),
        status: payment.status,
        paymentMethod: payment.payment_method,
        receiptNumber: payment.receipt_number,
        notes: payment.notes,
        createdAt: new Date(payment.created_at),
      });
    }

    res.status(201).json({ success: true, data: createdPayments });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update payment
router.put('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { classId, month, year, amount, dueDate, status, paymentMethod, receiptNumber, notes } = req.body;

    const payment = db.prepare('SELECT id FROM payments WHERE id = ?').get(id) as any;
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (classId !== undefined) { updates.push('class_id = ?'); values.push(classId); }
    if (month !== undefined) { updates.push('month = ?'); values.push(month); }
    if (year !== undefined) { updates.push('year = ?'); values.push(parseInt(year)); }
    if (amount !== undefined) { updates.push('amount = ?'); values.push(parseFloat(amount)); }
    if (dueDate !== undefined) { updates.push('due_date = ?'); values.push(dueDate); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (paymentMethod !== undefined) { updates.push('payment_method = ?'); values.push(paymentMethod); }
    if (receiptNumber !== undefined) { updates.push('receipt_number = ?'); values.push(receiptNumber); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE payments SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updatedPayment = db.prepare(`
      SELECT p.id, p.class_id, p.month, p.year, p.amount, p.due_date,
             p.status, p.payment_method, p.receipt_number, p.notes, p.created_at,
             c.name as class_name
      FROM payments p
      JOIN classes c ON p.class_id = c.id
      WHERE p.id = ?
    `).get(id) as any;

    res.json({
      success: true,
      data: {
        id: updatedPayment.id,
        classId: updatedPayment.class_id,
        className: updatedPayment.class_name,
        month: updatedPayment.month,
        year: updatedPayment.year,
        amount: updatedPayment.amount,
        dueDate: new Date(updatedPayment.due_date),
        status: updatedPayment.status,
        paymentMethod: updatedPayment.payment_method,
        receiptNumber: updatedPayment.receipt_number,
        notes: updatedPayment.notes,
        createdAt: new Date(updatedPayment.created_at),
      },
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const payment = db.prepare('SELECT id FROM payments WHERE id = ?').get(id) as any;
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    db.prepare('DELETE FROM payments WHERE id = ?').run(id);

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
