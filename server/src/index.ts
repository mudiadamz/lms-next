import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './database/schema.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import classRoutes from './routes/classes.js';
import subjectRoutes from './routes/subjects.js';
import assignmentRoutes from './routes/assignments.js';
import quizRoutes from './routes/quizzes.js';
import materialRoutes from './routes/materials.js';
import attendanceRoutes from './routes/attendance.js';
import gradeRoutes from './routes/grades.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware - CORS (allow all for Railway deployment)
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check - BEFORE database init to ensure it responds quickly
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Initialize database with error handling
let dbInitialized = false;
setTimeout(() => {
  try {
    createTables();
    dbInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    console.error('Error message:', error?.message);
    // Continue anyway - tables might already exist or will be created on first request
    if (error?.message?.includes('already exists')) {
      dbInitialized = true;
      console.log('✅ Tables already exist');
    }
  }
}, 100); // Small delay to ensure server starts first

// API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Alias for convenience
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'LMS API Server',
    database: dbInitialized ? 'initialized' : 'not initialized',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.path });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Request error:', err);
  console.error('Error stack:', err?.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit - let Railway handle restart
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Server is running on port', PORT);
  console.log('🌐 API available at http://0.0.0.0:' + PORT + '/api');
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('💾 Database initialized:', dbInitialized);
  console.log('✅ Server ready to accept connections');
}).on('error', (err: any) => {
  console.error('❌ Failed to start server:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export for Vercel serverless (if needed)
export default app;
