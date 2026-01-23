import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import './SubjectManagement.css';

const mockSubjects = [
  {
    id: '1',
    name: 'Matematika',
    code: 'MAT',
    description: 'Mata pelajaran matematika untuk semua tingkat',
    schoolLevel: 'sma',
    teacher: 'Ibu Siti',
    classCount: 5,
  },
  {
    id: '2',
    name: 'Bahasa Indonesia',
    code: 'BIN',
    description: 'Mata pelajaran bahasa Indonesia',
    schoolLevel: 'sma',
    teacher: 'Bapak Budi',
    classCount: 5,
  },
  {
    id: '3',
    name: 'IPA',
    code: 'IPA',
    description: 'Ilmu Pengetahuan Alam',
    schoolLevel: 'smp',
    teacher: 'Ibu Rina',
    classCount: 3,
  },
];

export const SubjectManagement = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<typeof mockSubjects[0] | null>(null);
  const [subjects, setSubjects] = useState(mockSubjects);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    schoolLevel: '',
    teacherId: '',
  });

  const filteredSubjects = subjects.filter((subject) => {
    const matchesLevel = selectedLevel === 'all' || subject.schoolLevel === selectedLevel;
    return matchesLevel;
  });

  const handleCreate = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      schoolLevel: '',
      teacherId: '',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (subject: typeof mockSubjects[0]) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      schoolLevel: subject.schoolLevel,
      teacherId: subject.teacher,
    });
    setShowEditModal(true);
  };

  const handleDelete = (subject: typeof mockSubjects[0]) => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (showEditModal && selectedSubject) {
        // Update existing subject
        setSubjects(subjects.map((s) => 
          s.id === selectedSubject.id 
            ? { ...s, ...formData, teacher: formData.teacherId === '1' ? 'Ibu Siti' : 'Bapak Budi' }
            : s
        ));
      } else {
        // Create new subject
        const newSubject = {
          id: Date.now().toString(),
          name: formData.name,
          code: formData.code,
          description: formData.description,
          schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma',
          teacher: formData.teacherId === '1' ? 'Ibu Siti' : 'Bapak Budi',
          classCount: 0,
        };
        setSubjects([...subjects, newSubject]);
      }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        schoolLevel: '',
        teacherId: '',
      });
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Gagal menyimpan mata pelajaran');
    }
  };

  const confirmDelete = async () => {
    if (!selectedSubject) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubjects(subjects.filter((s) => s.id !== selectedSubject.id));
      setShowDeleteDialog(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Gagal menghapus mata pelajaran');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Mata Pelajaran',
      render: (item: typeof mockSubjects[0]) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kode: {item.code}</span>
        </div>
      ),
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat',
      render: (item: typeof mockSubjects[0]) => (
        <Badge variant="secondary">{SCHOOL_LEVELS[item.schoolLevel]}</Badge>
      ),
    },
    {
      key: 'teacher',
      header: 'Guru Pengampu',
    },
    {
      key: 'classCount',
      header: 'Jumlah Kelas',
      render: (item: typeof mockSubjects[0]) => `${item.classCount} kelas`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockSubjects[0]) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            { label: 'Detail', onClick: () => navigate(`${ROUTES.ADMIN_SUBJECTS_DETAIL.replace(':id', item.id)}`) },
            { label: 'Edit', onClick: () => handleEdit(item) },
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
      <div className="subject-management">
        <div className="page-header">
          <h1>Manajemen Mata Pelajaran</h1>
          <Button onClick={handleCreate}>Tambah Mata Pelajaran</Button>
        </div>

        <div className="page-filters">
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

        <Card title={`Daftar Mata Pelajaran (${filteredSubjects.length})`} variant="elevated">
          <Table columns={columns} data={filteredSubjects} />
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Mata Pelajaran"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="subject-form">
            <FormInput
              label="Nama Mata Pelajaran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Kode"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="MAT"
            />
            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: '', label: 'Pilih tingkat' },
                { value: 'sd', label: 'SD' },
                { value: 'smp', label: 'SMP' },
                { value: 'sma', label: 'SMA' },
              ]}
              required
            />
            <FormSelect
              label="Guru Pengampu"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                { value: '1', label: 'Ibu Siti' },
                { value: '2', label: 'Bapak Budi' },
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Mata Pelajaran"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="subject-form">
            <FormInput
              label="Nama Mata Pelajaran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Kode"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: '', label: 'Pilih tingkat' },
                { value: 'sd', label: 'SD' },
                { value: 'smp', label: 'SMP' },
                { value: 'sma', label: 'SMA' },
              ]}
              required
            />
            <FormSelect
              label="Guru Pengampu"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                { value: '1', label: 'Ibu Siti' },
                { value: '2', label: 'Bapak Budi' },
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedSubject(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Mata Pelajaran"
          message={`Apakah Anda yakin ingin menghapus mata pelajaran "${selectedSubject?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};

