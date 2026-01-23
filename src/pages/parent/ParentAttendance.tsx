import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Loading } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService, userService, subjectService } from '../../services';
import { formatDate, getRelativeTime } from '../../utils';
import { ATTENDANCE_STATUS_LABELS } from '../../constants';
import './ParentAttendance.css';

export const ParentAttendance = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const [attendancesData, subjectsData] = await Promise.all([
          Promise.all(studentIds.map((studentId: string) => attendanceService.getAttendance({ studentId }))).then(results => results.flat()),
          subjectService.getSubjects(),
        ]);

        setAttendances(attendancesData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);

        // Calculate stats for current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthAttendances = attendancesData.filter(a => new Date(a.date) >= monthStart);
        const presentCount = monthAttendances.filter(a => a.status === 'present').length;
        const totalCount = monthAttendances.length;
        setStats({
          total: totalCount,
          present: presentCount,
          percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
        });
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const columns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: any) => (
        <div>
          <strong>{formatDate(new Date(item.date))}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
            {getRelativeTime(new Date(item.date))}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: any) => <strong>{subjects[item.subjectId] || item.subjectId}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <Badge variant={item.status === 'present' ? 'success' : item.status === 'absent' ? 'danger' : item.status === 'late' ? 'warning' : 'info'}>
          {ATTENDANCE_STATUS_LABELS[item.status] as string}
        </Badge>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (item: any) => item.notes || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="parent-attendance">
        <h1>Absensi Anak</h1>
        
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Card title="Riwayat Kehadiran" variant="elevated">
              <div style={{ marginBottom: '1rem' }}>
                <p><strong>Kehadiran bulan ini:</strong> {stats.present}/{stats.total} hari</p>
                <p><strong>Persentase:</strong> {stats.percentage}%</p>
              </div>
              {attendances.length === 0 ? (
                <EmptyState
                  icon="userGroup"
                  title="Tidak Ada Data Absensi"
                  message="Belum ada data absensi yang tersedia."
                />
              ) : (
                <Table columns={columns} data={attendances.slice(0, 10)} />
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

