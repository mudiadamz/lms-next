# 🔄 Update All UI Components to Use APIs

## Status

### ✅ Completed
1. **AdminSchedule.tsx** - Updated to use scheduleService, classService, subjectService, userService, academicYearService
2. **Custom Hooks Created**:
   - `useSchedules.ts` - Hook for fetching schedules
   - `useAnnouncements.ts` - Hook for fetching announcements
   - `useForums.ts` - Hook for fetching forum posts
   - `useMessages.ts` - Hook for fetching messages/conversations
   - `useNotifications.ts` - Hook for fetching notifications
   - `useAcademicYears.ts` - Hook for fetching academic years

### ⚠️ Still Need Update (Using Mock Data)

#### Schedule Components
- **TeacherSchedule.tsx** - Need: scheduleService
- **StudentSchedule.tsx** - Need: scheduleService  
- **ParentSchedule.tsx** - Need: scheduleService

#### Announcement Components
- **AdminAnnouncements.tsx** - Need: announcementService, classService
- **TeacherAnnouncements.tsx** - Need: announcementService, classService
- **ParentAnnouncements.tsx** - Need: announcementService

#### Forum Components
- **StudentForum.tsx** - Need: forumService
- **TeacherForum.tsx** - Need: forumService
- **ParentForum.tsx** - Need: forumService
- **ForumDetail.tsx** (student) - Need: forumService
- **TeacherForumDetail.tsx** - Need: forumService
- **ParentForumDetail.tsx** - Need: forumService

#### Message Components
- **StudentMessages.tsx** - Need: messageService
- **TeacherMessages.tsx** - Need: messageService
- **ParentMessages.tsx** - Need: messageService
- **MessagesChat.tsx** (student) - Need: messageService
- **TeacherMessagesChat.tsx** - Need: messageService
- **ParentMessagesChat.tsx** - Need: messageService

#### Academic Year Components
- **AdminAcademicYear.tsx** - Need: academicYearService

#### Report Card Components
- **TeacherReports.tsx** - Need: reportCardService
- **TeacherReportDetail.tsx** - Need: reportCardService

#### Notification Components
- All dashboards need notification badges - Need: notificationService

## Pattern to Follow

Based on AdminSchedule.tsx update:

1. **Import services**:
```typescript
import { scheduleService, classService, ... } from '../../services';
```

2. **Add state for data**:
```typescript
const [schedules, setSchedules] = useState<Schedule[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

3. **Load data in useEffect**:
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, [dependencies]);
```

4. **Replace mock data** with API calls
5. **Add loading states** and error handling
6. **Update CRUD operations** to use services

## Next Steps

1. ✅ AdminSchedule.tsx - DONE
2. ⏳ Update remaining schedule components
3. ⏳ Update announcement components
4. ⏳ Update forum components
5. ⏳ Update message components
6. ⏳ Update academic year components
7. ⏳ Update report card components
8. ⏳ Add notifications to dashboards

## Files Created

- `src/hooks/useSchedules.ts`
- `src/hooks/useAnnouncements.ts`
- `src/hooks/useForums.ts`
- `src/hooks/useMessages.ts`
- `src/hooks/useNotifications.ts`
- `src/hooks/useAcademicYears.ts`

## Quick Update Commands

Untuk update semua komponen sekaligus, bisa menggunakan pattern yang sama seperti AdminSchedule.tsx.
