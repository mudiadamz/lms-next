# 📋 UI Integration Plan - Connect All APIs to Frontend

## Status: Komponen yang Perlu Diupdate

### ✅ Sudah Menggunakan API (Tidak Perlu Update)
- Login.tsx - sudah menggunakan authService ✅
- AssignmentDetail.tsx - sudah menggunakan assignmentService ✅
- CreateAssignment.tsx - sudah menggunakan assignmentService ✅
- EditAssignment.tsx - sudah menggunakan assignmentService ✅

### ⚠️ Masih Menggunakan Mock Data (Perlu Update)

#### 1. Schedule Components
- **AdminSchedule.tsx** - Perlu: scheduleService, classService, subjectService, userService, academicYearService
- **TeacherSchedule.tsx** - Perlu: scheduleService
- **StudentSchedule.tsx** - Perlu: scheduleService
- **ParentSchedule.tsx** - Perlu: scheduleService

#### 2. Announcement Components
- **AdminAnnouncements.tsx** - Perlu: announcementService, classService
- **TeacherAnnouncements.tsx** - Perlu: announcementService, classService
- **ParentAnnouncements.tsx** - Perlu: announcementService

#### 3. Forum Components
- **StudentForum.tsx** - Perlu: forumService
- **TeacherForum.tsx** - Perlu: forumService
- **ParentForum.tsx** - Perlu: forumService
- **ForumDetail.tsx** (student) - Perlu: forumService
- **TeacherForumDetail.tsx** - Perlu: forumService
- **ParentForumDetail.tsx** - Perlu: forumService

#### 4. Message Components
- **StudentMessages.tsx** - Perlu: messageService
- **TeacherMessages.tsx** - Perlu: messageService
- **ParentMessages.tsx** - Perlu: messageService
- **MessagesChat.tsx** (student) - Perlu: messageService
- **TeacherMessagesChat.tsx** - Perlu: messageService
- **ParentMessagesChat.tsx** - Perlu: messageService

#### 5. Academic Year Components
- **AdminAcademicYear.tsx** - Perlu: academicYearService

#### 6. Report Card Components
- **TeacherReports.tsx** - Perlu: reportCardService
- **TeacherReportDetail.tsx** - Perlu: reportCardService

#### 7. Notification Components
- Semua dashboard perlu menampilkan notifications - Perlu: notificationService

## Implementation Strategy

Karena ada banyak komponen yang perlu diupdate, saya akan membuat:
1. **Hook custom** untuk fetch data (useSchedules, useAnnouncements, dll)
2. **Update komponen utama** satu per satu
3. **Template pattern** untuk komponen serupa

## Next Steps

1. Buat custom hooks untuk data fetching
2. Update AdminSchedule.tsx sebagai contoh
3. Update komponen lainnya mengikuti pattern yang sama
4. Test semua komponen setelah update
