import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants';

// Auth Pages
import { Login } from '../pages/auth/Login';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentSubjects } from '../pages/student/StudentSubjects';
import { StudentMaterials } from '../pages/student/StudentMaterials';
import { StudentMaterialDetail } from '../pages/student/MaterialDetail';
import { StudentAssignments } from '../pages/student/StudentAssignments';
import { StudentAssignmentDetail } from '../pages/student/AssignmentDetail';
import { StudentQuizzes } from '../pages/student/StudentQuizzes';
import { StudentQuizDetail } from '../pages/student/QuizDetail';
import { StudentGrades } from '../pages/student/StudentGrades';
import { StudentSchedule } from '../pages/student/StudentSchedule';
import { StudentAttendance } from '../pages/student/StudentAttendance';
import { StudentForum } from '../pages/student/StudentForum';
import { StudentForumDetail } from '../pages/student/ForumDetail';
import { StudentMessages } from '../pages/student/StudentMessages';
import { StudentMessagesChat } from '../pages/student/MessagesChat';
import { StudentPortfolio } from '../pages/student/StudentPortfolio';
import { StudentCalendar } from '../pages/student/StudentCalendar';
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentPayment } from '../pages/student/StudentPayment';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherClasses } from '../pages/teacher/TeacherClasses';
import { TeacherClassDetail } from '../pages/teacher/TeacherClassDetail';
import { TeacherClassManage } from '../pages/teacher/TeacherClassManage';
import { TeacherMaterials } from '../pages/teacher/TeacherMaterials';
import { CreateMaterial } from '../pages/teacher/CreateMaterial';
import { TeacherAssignments } from '../pages/teacher/TeacherAssignments';
import { CreateAssignment } from '../pages/teacher/CreateAssignment';
import { AssignmentDetail } from '../pages/teacher/AssignmentDetail';
import { EditAssignment } from '../pages/teacher/EditAssignment';
import { GradingInterface } from '../pages/teacher/GradingInterface';
import { TeacherQuizzes } from '../pages/teacher/TeacherQuizzes';
import { CreateQuiz } from '../pages/teacher/CreateQuiz';
import { TeacherGrading } from '../pages/teacher/TeacherGrading';
import { TeacherAttendance } from '../pages/teacher/TeacherAttendance';
import { TeacherForum } from '../pages/teacher/TeacherForum';
import { TeacherForumDetail } from '../pages/teacher/TeacherForumDetail';
import { TeacherSchedule } from '../pages/teacher/TeacherSchedule';
import { TeacherReports } from '../pages/teacher/TeacherReports';
import { TeacherReportDetail } from '../pages/teacher/TeacherReportDetail';
import { TeacherMessages } from '../pages/teacher/TeacherMessages';
import { TeacherMessagesChat } from '../pages/teacher/TeacherMessagesChat';
import { TeacherAnnouncements } from '../pages/teacher/TeacherAnnouncements';
import { TeacherAnalytics } from '../pages/teacher/TeacherAnalytics';
import { TeacherQuestionBank } from '../pages/teacher/TeacherQuestionBank';
import { TeacherProfile } from '../pages/teacher/TeacherProfile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminUsersCreate } from '../pages/admin/AdminUsersCreate';
import { AdminClasses } from '../pages/admin/AdminClasses';
import { AdminClassesCreate } from '../pages/admin/AdminClassesCreate';
import { AdminClassesEdit } from '../pages/admin/AdminClassesEdit';
import { AdminClassesDetail } from '../pages/admin/AdminClassesDetail';
import { AdminClassesStudents } from '../pages/admin/AdminClassesStudents';
import { AdminSubjects } from '../pages/admin/AdminSubjects';
import { SubjectManagement } from '../pages/admin/SubjectManagement';
import { AdminSubjectsDetail } from '../pages/admin/AdminSubjectsDetail';
import { AdminSchedule } from '../pages/admin/AdminSchedule';
import { AdminAcademicYear } from '../pages/admin/AdminAcademicYear';
import { AdminAnnouncements } from '../pages/admin/AdminAnnouncements';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AdminCurriculum } from '../pages/admin/AdminCurriculum';
import { AdminAuditLog } from '../pages/admin/AdminAuditLog';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { AdminPayment } from '../pages/admin/AdminPayment';

// Parent Pages
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { ParentChildProfile } from '../pages/parent/ParentChildProfile';
import { ParentSchedule } from '../pages/parent/ParentSchedule';
import { ParentGrades } from '../pages/parent/ParentGrades';
import { ParentAttendance } from '../pages/parent/ParentAttendance';
import { ParentAssignments } from '../pages/parent/ParentAssignments';
import { ParentAssignmentDetail } from '../pages/parent/ParentAssignmentDetail';
import { ParentMessages } from '../pages/parent/ParentMessages';
import { ParentMessagesChat } from '../pages/parent/ParentMessagesChat';
import { ParentCalendar } from '../pages/parent/ParentCalendar';
import { ParentAnnouncements } from '../pages/parent/ParentAnnouncements';
import { ParentProgress } from '../pages/parent/ParentProgress';
import { ParentActivity } from '../pages/parent/ParentActivity';
import { ParentSubjects } from '../pages/parent/ParentSubjects';
import { ParentMaterials } from '../pages/parent/ParentMaterials';
import { ParentMaterialDetail } from '../pages/parent/ParentMaterialDetail';
import { ParentQuizzes } from '../pages/parent/ParentQuizzes';
import { ParentQuizDetail } from '../pages/parent/ParentQuizDetail';
import { ParentForum } from '../pages/parent/ParentForum';
import { ParentForumDetail } from '../pages/parent/ParentForumDetail';
import { ParentPortfolio } from '../pages/parent/ParentPortfolio';
import { ParentProfile } from '../pages/parent/ParentProfile';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      
      {/* Protected Student Routes */}
      <Route
        path={ROUTES.STUDENT_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_SUBJECTS}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_MATERIALS}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_MATERIAL_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMaterialDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_ASSIGNMENTS}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_ASSIGNMENT_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAssignmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_QUIZZES}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_QUIZ_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentQuizDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_GRADES}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_SCHEDULE}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_ATTENDANCE}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_FORUM}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentForum />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_FORUM_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentForumDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_MESSAGES}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_MESSAGE_CHAT}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMessagesChat />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_PORTFOLIO}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPortfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_CALENDAR}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_PROFILE}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STUDENT_PAYMENT}
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPayment />
          </ProtectedRoute>
        }
      />

      {/* Protected Teacher Routes */}
      <Route
        path={ROUTES.TEACHER_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_CLASSES}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_CLASSES_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherClassDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_CLASSES_MANAGE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherClassManage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_MATERIALS}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_MATERIALS_CREATE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateMaterial />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ASSIGNMENTS}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ASSIGNMENTS_CREATE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ASSIGNMENT_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AssignmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ASSIGNMENT_EDIT}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <EditAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ASSIGNMENT_GRADE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <GradingInterface />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_QUIZZES}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_QUIZZES_CREATE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_GRADING}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherGrading />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ATTENDANCE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_FORUM}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherForum />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_FORUM_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherForumDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_SCHEDULE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_REPORTS}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_REPORTS_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherReportDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_MESSAGES}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_MESSAGES_CHAT}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherMessagesChat />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ANNOUNCEMENTS}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_ANALYTICS}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_QUESTION_BANK}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherQuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TEACHER_PROFILE}
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.ADMIN_USERS}/create/:role`}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CLASSES}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CLASSES_CREATE}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClassesCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CLASSES_EDIT}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClassesEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CLASSES_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClassesDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CLASSES_STUDENTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClassesStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SUBJECTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SUBJECT_MANAGEMENT}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SubjectManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SUBJECTS_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSubjectsDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SCHEDULE}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_ACADEMIC_YEAR}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAcademicYear />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_ANNOUNCEMENTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_REPORTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SETTINGS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CURRICULUM}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCurriculum />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_AUDIT_LOG}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAuditLog />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PROFILE}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PAYMENT}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPayment />
          </ProtectedRoute>
        }
      />

      {/* Protected Parent Routes */}
      <Route
        path={ROUTES.PARENT_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_CHILD_PROFILE}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentChildProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_SCHEDULE}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_GRADES}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_ATTENDANCE}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_ASSIGNMENTS}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_ASSIGNMENT_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAssignmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_MESSAGES}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_MESSAGE_CHAT}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentMessagesChat />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_SUBJECTS}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_MATERIALS}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_MATERIAL_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentMaterialDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_QUIZZES}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_QUIZ_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentQuizDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_FORUM}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentForum />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_FORUM_DETAIL}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentForumDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_PORTFOLIO}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentPortfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_CALENDAR}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_PROFILE}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_ANNOUNCEMENTS}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_PROGRESS}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PARENT_ACTIVITY}
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentActivity />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

