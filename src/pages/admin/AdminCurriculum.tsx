import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, SearchBar, Table, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, ConfirmDialog, Icon, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS } from '../../constants';
import './AdminCurriculum.css';

// Interface untuk Curriculum
interface Curriculum {
  id: string;
  name: string;
  description: string;
  schoolLevel: 'sd' | 'smp' | 'sma' | 'all';
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

// Contoh data kurikulum
const mockCurriculums: Curriculum[] = [
  {
    id: '1',
    name: 'Kurikulum Merdeka',
    description: 'Kurikulum Merdeka adalah kurikulum dengan pembelajaran intrakurikuler yang beragam di mana konten akan lebih optimal agar peserta didik memiliki cukup waktu untuk mendalami konsep dan menguatkan kompetensi.',
    schoolLevel: 'all',
    isActive: true,
    startDate: new Date('2023-07-01'),
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Kurikulum 2013',
    description: 'Kurikulum 2013 adalah kurikulum yang mengembangkan kompetensi siswa dalam ranah pengetahuan, keterampilan, dan sikap secara utuh.',
    schoolLevel: 'all',
    isActive: false,
    startDate: new Date('2013-07-01'),
    endDate: new Date('2023-06-30'),
    createdAt: new Date('2013-01-01'),
  },
  {
    id: '3',
    name: 'Kurikulum Khusus SD',
    description: 'Kurikulum khusus untuk Sekolah Dasar dengan fokus pada pengembangan karakter dan literasi dasar.',
    schoolLevel: 'sd',
    isActive: false,
    startDate: new Date('2022-07-01'),
    createdAt: new Date('2022-01-01'),
  },
];

export const AdminCurriculum = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>(mockCurriculums);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schoolLevel: 'all',
    startDate: '',
    endDate: '',
  });

  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch =
      curriculum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      selectedLevel === 'all' ||
      curriculum.schoolLevel === selectedLevel ||
      curriculum.schoolLevel === 'all';
    return matchesSearch && matchesLevel;
  });

  const activeCurriculum = curriculums.find((c) => c.isActive);

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      schoolLevel: 'all',
      startDate: '',
      endDate: '',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setFormData({
      name: curriculum.name,
      description: curriculum.description,
      schoolLevel: curriculum.schoolLevel,
      startDate: curriculum.startDate && !isNaN(curriculum.startDate.getTime())
        ? curriculum.startDate.toISOString().split('T')[0]
        : '',
      endDate: curriculum.endDate && !isNaN(curriculum.endDate.getTime())
        ? curriculum.endDate.toISOString().split('T')[0]
        : '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowDeleteDialog(true);
  };

  const handleActivate = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowActivateDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (showEditModal && selectedCurriculum) {
        // Update existing curriculum
        const startDate = new Date(formData.startDate);
        
        // Validate start date
        if (isNaN(startDate.getTime())) {
          alert('Tanggal mulai tidak valid');
          return;
        }
        
        const updatedCurriculum: Curriculum = {
          ...selectedCurriculum,
          name: formData.name,
          description: formData.description,
          schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma' | 'all',
          startDate: startDate,
          endDate: formData.endDate ? (() => {
            const endDate = new Date(formData.endDate);
            return isNaN(endDate.getTime()) ? undefined : endDate;
          })() : undefined,
        };
        setCurriculums(
          curriculums.map((c) => (c.id === selectedCurriculum.id ? updatedCurriculum : c))
        );
      } else {
        // Create new curriculum
        const startDate = new Date(formData.startDate);
        
        // Validate start date
        if (isNaN(startDate.getTime())) {
          alert('Tanggal mulai tidak valid');
          return;
        }
        
        const newCurriculum: Curriculum = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma' | 'all',
          isActive: false,
          startDate: startDate,
          endDate: formData.endDate ? (() => {
            const endDate = new Date(formData.endDate);
            return isNaN(endDate.getTime()) ? undefined : endDate;
          })() : undefined,
          createdAt: new Date(),
        };
        setCurriculums([...curriculums, newCurriculum]);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: '',
        description: '',
        schoolLevel: 'all',
        startDate: '',
        endDate: '',
      });
      setSelectedCurriculum(null);
    } catch (error) {
      console.error('Error saving curriculum:', error);
      alert('Gagal menyimpan kurikulum');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCurriculum) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurriculums(curriculums.filter((c) => c.id !== selectedCurriculum.id));
      setShowDeleteDialog(false);
      setSelectedCurriculum(null);
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      alert('Gagal menghapus kurikulum');
    }
  };

  const confirmActivate = async () => {
    if (!selectedCurriculum) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Deactivate all curriculums first, then activate selected one
      setCurriculums(
        curriculums.map((c) => ({
          ...c,
          isActive: c.id === selectedCurriculum.id,
        }))
      );
      setShowActivateDialog(false);
      setSelectedCurriculum(null);
    } catch (error) {
      console.error('Error activating curriculum:', error);
      alert('Gagal mengaktifkan kurikulum');
    }
  };

  const getSchoolLevelLabel = (level: string) => {
    if (level === 'all') return 'Semua Tingkat';
    return SCHOOL_LEVELS[level as keyof typeof SCHOOL_LEVELS] || level;
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Kurikulum',
      render: (item: Curriculum) => (
        <div>
          <strong>{item.name}</strong>
          {item.isActive && (
            <Badge variant="success" style={{ marginLeft: '0.5rem' }}>
              Aktif
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (item: Curriculum) => (
        <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.description}
        </div>
      ),
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat Sekolah',
      render: (item: Curriculum) => (
        <Badge variant="secondary">{getSchoolLevelLabel(item.schoolLevel)}</Badge>
      ),
    },
    {
      key: 'startDate',
      header: 'Tanggal Mulai',
      render: (item: Curriculum) => formatDate(item.startDate),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Curriculum) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            ...(item.isActive
              ? []
              : [{ label: 'Aktifkan', onClick: () => handleActivate(item) }]),
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
      <div className="admin-curriculum">
        <div className="page-header">
          <h1>Manajemen Kurikulum</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Tambah Kurikulum
          </Button>
        </div>

        {activeCurriculum && (
          <Card title="Kurikulum Aktif" variant="elevated" style={{ marginBottom: '1.5rem' }}>
            <div className="active-curriculum-info">
              <div className="active-curriculum-name">
                <strong>{activeCurriculum.name}</strong>
                <Badge variant="success" style={{ marginLeft: '0.5rem' }}>
                  Aktif
                </Badge>
              </div>
              <p className="active-curriculum-description">{activeCurriculum.description}</p>
              <div className="active-curriculum-dates">
                <span>Mulai: {formatDate(activeCurriculum.startDate)}</span>
                {activeCurriculum.endDate && (
                  <span style={{ marginLeft: '1rem' }}>
                    Selesai: {formatDate(activeCurriculum.endDate)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="page-filters">
          <SearchBar
            placeholder="Cari kurikulum..."
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

        {filteredCurriculums.length === 0 ? (
          <EmptyState
            icon="book"
            title="Tidak Ada Kurikulum"
            message={searchTerm || selectedLevel !== 'all'
              ? 'Tidak ada kurikulum yang sesuai dengan filter yang dipilih.'
              : 'Belum ada kurikulum yang terdaftar.'}
            action={{
              label: 'Tambah Kurikulum',
              onClick: handleCreate,
            }}
          />
        ) : (
          <Card title={`Daftar Kurikulum (${filteredCurriculums.length})`} variant="elevated">
            <Table columns={columns} data={filteredCurriculums} />
          </Card>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              name: '',
              description: '',
              schoolLevel: 'all',
              startDate: '',
              endDate: '',
            });
          }}
          title="Tambah Kurikulum"
          size="large"
        >
          <form onSubmit={handleSubmit} className="curriculum-form">
            <FormInput
              label="Nama Kurikulum"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kurikulum Merdeka"
              required
            />
            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Masukkan deskripsi kurikulum"
              rows={4}
              required
            />
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: 'all', label: 'Semua Tingkat' },
                ...Object.entries(SCHOOL_LEVELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              required
            />
            <div className="form-row">
              <FormInput
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormInput
                label="Tanggal Selesai (Opsional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
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
          onClose={() => {
            setShowEditModal(false);
            setSelectedCurriculum(null);
          }}
          title="Edit Kurikulum"
          size="large"
        >
          <form onSubmit={handleSubmit} className="curriculum-form">
            <FormInput
              label="Nama Kurikulum"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: 'all', label: 'Semua Tingkat' },
                ...Object.entries(SCHOOL_LEVELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              required
            />
            <div className="form-row">
              <FormInput
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormInput
                label="Tanggal Selesai (Opsional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
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
            setSelectedCurriculum(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Kurikulum"
          message={`Apakah Anda yakin ingin menghapus kurikulum "${selectedCurriculum?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={showActivateDialog}
          onClose={() => {
            setShowActivateDialog(false);
            setSelectedCurriculum(null);
          }}
          onConfirm={confirmActivate}
          title="Aktifkan Kurikulum"
          message={`Apakah Anda yakin ingin mengaktifkan kurikulum "${selectedCurriculum?.name}"? Kurikulum yang sedang aktif akan dinonaktifkan.`}
          confirmLabel="Aktifkan"
          variant="primary"
        />
      </div>
    </DashboardLayout>
  );
};
