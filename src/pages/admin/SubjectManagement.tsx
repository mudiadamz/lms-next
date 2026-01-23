import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormSelect, FormTextarea, ConfirmDialog, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { subjectService, userService, classService } from '../../services';
import './SubjectManagement.css';

export const SubjectManagement = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    schoolLevel: '',
    teacherId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [subjectsData, teachersData, classesData] = await Promise.all([
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
          classService.getClasses(),
        ]);

        // Calculate classCount for each subject
        const subjectsWithCounts = subjectsData.map(subject => {
          const classCount = classesData.filter(c => {
            const subjectIds = (c as any).subjectIds || [];
            return subjectIds.includes(subject.id);
          }).length;

          const teacher = teachersData.find(t => t.id === subject.teacherId);
          return {
            ...subject,
            teacher: teacher?.fullName || '-',
            classCount,
          };
        });

        setSubjects(subjectsWithCounts);
        setTeachers(teachersData.map(t => ({ value: t.id, label: t.fullName })));
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      schoolLevel: subject.schoolLevel,
      teacherId: subject.teacherId || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (subject: any) => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (showEditModal && selectedSubject) {
        await subjectService.updateSubject(selectedSubject.id, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma',
          teacherId: formData.teacherId,
        });
      } else {
        await subjectService.createSubject({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma',
          teacherId: formData.teacherId,
        });
      }
      
      // Reload data
      const [subjectsData, teachersData, classesData] = await Promise.all([
        subjectService.getSubjects(),
        userService.getUsers('teacher'),
        classService.getClasses(),
      ]);

      const subjectsWithCounts = subjectsData.map(subject => {
        const classCount = classesData.filter(c => {
          const subjectIds = (c as any).subjectIds || [];
          return subjectIds.includes(subject.id);
        }).length;

        const teacher = teachersData.find(t => t.id === subject.teacherId);
        return {
          ...subject,
          teacher: teacher?.fullName || '-',
          classCount,
        };
      });

      setSubjects(subjectsWithCounts);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.deleteSubject(selectedSubject.id);
      setSubjects(subjects.filter((s) => s.id !== selectedSubject.id));
      setShowDeleteDialog(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Gagal menghapus mata pelajaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Mata Pelajaran',
      render: (item: any) => (
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
      render: (item: any) => (
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
      render: (item: any) => `${item.classCount || 0} kelas`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
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

        {isLoading ? (
          <Loading />
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            icon="book"
            title="Tidak Ada Mata Pelajaran"
            message={selectedLevel !== 'all'
              ? 'Tidak ada mata pelajaran yang sesuai dengan filter yang dipilih.'
              : 'Belum ada mata pelajaran yang terdaftar.'}
          />
        ) : (
          <Card title={`Daftar Mata Pelajaran (${filteredSubjects.length})`} variant="elevated">
            <Table columns={columns} data={filteredSubjects} />
          </Card>
        )}

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
                ...teachers,
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>Simpan</Button>
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
                ...teachers,
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>Simpan Perubahan</Button>
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

