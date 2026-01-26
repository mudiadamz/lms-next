import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table, Dropdown, EmptyState, Icon, ConfirmDialog, Loading } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { classService, userService } from '../../services';
import './AdminClasses.css';

export const AdminClasses = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, teachersData] = await Promise.all([
          classService.getClasses(),
          userService.getUsers('teacher'),
        ]);

        // Remove duplicates based on name + schoolLevel combination
        // Keep the first occurrence of each unique combination
        const uniqueClassesMap = new Map<string, any>();
        classesData.forEach((cls: any) => {
          const key = `${cls.name}_${cls.schoolLevel}`;
          if (!uniqueClassesMap.has(key)) {
            uniqueClassesMap.set(key, cls);
          }
        });
        const uniqueClasses = Array.from(uniqueClassesMap.values());

        setClasses(uniqueClasses);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredClasses = classes.filter((cls) => {
    const matchesLevel = selectedLevel === 'all' || cls.schoolLevel === selectedLevel;
    return matchesLevel;
  });

  const handleDelete = (cls: any) => {
    setSelectedClass(cls);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedClass) return;
    try {
      await classService.deleteClass(selectedClass.id);
      setClasses(classes.filter((c) => c.id !== selectedClass.id));
      setShowDeleteDialog(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Gagal menghapus kelas');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Kelas',
      render: (item: any) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            ID: {item.id}
          </span>
          <br />
          <Badge variant="secondary">{SCHOOL_LEVELS[item.schoolLevel]}</Badge>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Kelas',
      render: (item: any) => `Kelas ${item.grade || '-'}`,
    },
    {
      key: 'homeroomTeacher',
      header: 'Wali Kelas',
      render: (item: any) => teachers[(item as any).homeroomTeacherId] || (item as any).homeroomTeacher || '-',
    },
    {
      key: 'studentCount',
      header: 'Siswa',
      render: (item: any) => {
        const studentCount = (item as any).studentCount ?? 0;
        const maxStudents = (item as any).maxStudents ?? 36;
        const isFull = maxStudents > 0 && studentCount >= maxStudents;
        return (
          <div>
            {studentCount}/{maxStudents}
            <Badge
              variant={isFull ? 'danger' : 'primary'}
              style={{ marginLeft: '0.5rem' }}
            >
              {isFull ? 'Penuh' : 'Tersedia'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            { label: 'Detail', onClick: () => navigate(`${ROUTES.ADMIN_CLASSES_DETAIL.replace(':id', item.id)}`) },
            { label: 'Edit', onClick: () => navigate(`${ROUTES.ADMIN_CLASSES_EDIT.replace(':id', item.id)}`) },
            { divider: true },
            { label: 'Hapus', onClick: () => handleDelete(item) },
          ]}
          align="right"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-classes">
        <div className="page-header">
          <h1>Kelas</h1>
          <Button onClick={() => navigate(ROUTES.ADMIN_CLASSES_CREATE)}>Tambah Kelas</Button>
        </div>

        <div className="page-filters">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Tingkat</option>
            <option value="sd">SD</option>
            <option value="smp">SMP</option>
            <option value="sma">SMA</option>
          </select>
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Kelas"
            message={selectedLevel !== 'all' 
              ? 'Tidak ada kelas yang sesuai dengan filter yang dipilih.'
              : 'Belum ada kelas yang terdaftar.'}
            action={{ 
              label: 'Tambah Kelas', 
              onClick: () => navigate(ROUTES.ADMIN_CLASSES_CREATE) 
            }}
          />
        ) : (
          <Card title={`Daftar Kelas (${filteredClasses.length})`} variant="elevated">
            <Table columns={columns} data={filteredClasses} />
          </Card>
        )}

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedClass(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Kelas"
          message={`Apakah Anda yakin ingin menghapus kelas "${selectedClass?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};


