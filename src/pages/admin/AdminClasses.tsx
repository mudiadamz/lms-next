import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar, Table, Dropdown, EmptyState, Icon, ConfirmDialog } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import './AdminClasses.css';

const mockClasses = [
  {
    id: '1',
    name: 'X IPA 1',
    grade: 10,
    schoolLevel: 'sma',
    homeroomTeacher: 'Ibu Siti',
    studentCount: 30,
    maxStudents: 36,
  },
  {
    id: '2',
    name: 'X IPA 2',
    grade: 10,
    schoolLevel: 'sma',
    homeroomTeacher: 'Bapak Budi',
    studentCount: 28,
    maxStudents: 36,
  },
  {
    id: '3',
    name: 'XI IPA 1',
    grade: 11,
    schoolLevel: 'sma',
    homeroomTeacher: 'Ibu Rina',
    studentCount: 32,
    maxStudents: 36,
  },
];

export const AdminClasses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<typeof mockClasses[0] | null>(null);
  const [classes, setClasses] = useState(mockClasses);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || cls.schoolLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleDelete = (cls: typeof mockClasses[0]) => {
    setSelectedClass(cls);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedClass) return;
    try {
      // TODO: Call classService.deleteClass
      await new Promise((resolve) => setTimeout(resolve, 500));
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
      render: (item: typeof mockClasses[0]) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <Badge variant="secondary">{SCHOOL_LEVELS[item.schoolLevel]}</Badge>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Kelas',
      render: (item: typeof mockClasses[0]) => `Kelas ${item.grade}`,
    },
    {
      key: 'homeroomTeacher',
      header: 'Wali Kelas',
    },
    {
      key: 'studentCount',
      header: 'Siswa',
      render: (item: typeof mockClasses[0]) => (
        <div>
          {item.studentCount}/{item.maxStudents}
          <Badge
            variant={item.studentCount >= item.maxStudents ? 'danger' : 'primary'}
            style={{ marginLeft: '0.5rem' }}
          >
            {Math.round((item.studentCount / item.maxStudents) * 100)}%
          </Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockClasses[0]) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            { label: 'Detail', onClick: () => navigate(`${ROUTES.ADMIN_CLASSES_DETAIL.replace(':id', item.id)}`) },
            { label: 'Edit', onClick: () => navigate(`${ROUTES.ADMIN_CLASSES_EDIT.replace(':id', item.id)}`) },
            { label: 'Daftar Siswa', onClick: () => navigate(`${ROUTES.ADMIN_CLASSES_STUDENTS.replace(':id', item.id)}`) },
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
          <h1>Manajemen Kelas</h1>
          <Button onClick={() => navigate(ROUTES.ADMIN_CLASSES_CREATE)}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Tambah Kelas
          </Button>
        </div>

        <div className="page-filters">
          <SearchBar
            placeholder="Cari kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
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
        </div>

        {filteredClasses.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Kelas"
            message={searchTerm || selectedLevel !== 'all' 
              ? 'Tidak ada kelas yang sesuai dengan filter yang dipilih.'
              : 'Belum ada kelas yang terdaftar.'}
            action={{ 
              label: 'Tambah Kelas', 
              onClick: () => navigate(ROUTES.ADMIN_CLASSES_CREATE) 
            }}
          />
        ) : (
          <Card 
            title={`Daftar Kelas (${filteredClasses.length})`} 
            variant="elevated"
          >
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

