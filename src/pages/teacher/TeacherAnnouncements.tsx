import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, Icon, EmptyState, Pagination } from '../../components/common';
import { Announcement } from '../../types';
import { formatDate, getRelativeTime } from '../../utils';
import './TeacherAnnouncements.css';

const MOCK_CLASSES = [
  { value: 'class1', label: 'X IPA 1' },
  { value: 'class2', label: 'X IPA 2' },
  { value: 'class3', label: 'XI IPA 1' },
];

// Contoh data pengumuman
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Pengumuman Ujian Tengah Semester',
    content: 'Ujian Tengah Semester akan dilaksanakan pada tanggal 20-25 Februari 2024. Silakan persiapkan diri dengan baik dan jangan lupa membawa alat tulis lengkap.',
    authorId: 'teacher1',
    targetAudience: ['student'],
    classId: 'class1',
    isPinned: true,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-25'),
    createdAt: new Date('2024-01-20T09:00:00'),
  },
  {
    id: '2',
    title: 'Pengumpulan Tugas Matematika',
    content: 'Tugas matematika bab aljabar harus dikumpulkan paling lambat hari Jumat, 26 Januari 2024. Silakan submit melalui sistem LMS.',
    authorId: 'teacher1',
    targetAudience: ['student'],
    classId: 'class1',
    isPinned: false,
    startDate: new Date('2024-01-22'),
    endDate: new Date('2024-01-26'),
    createdAt: new Date('2024-01-22T10:00:00'),
  },
  {
    id: '3',
    title: 'Rapat Orang Tua Siswa',
    content: 'Diharapkan kehadiran orang tua siswa kelas X IPA 1 untuk menghadiri rapat pada tanggal 30 Januari 2024 pukul 09:00 WIB di aula sekolah.',
    authorId: 'teacher1',
    targetAudience: ['parent'],
    classId: 'class1',
    isPinned: true,
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-01-30'),
    createdAt: new Date('2024-01-25T08:00:00'),
  },
  {
    id: '4',
    title: 'Remedial Test',
    content: 'Bagi siswa yang nilai UTS di bawah KKM, akan diadakan remedial test pada tanggal 5 Maret 2024. Silakan persiapkan diri.',
    authorId: 'teacher1',
    targetAudience: ['student'],
    classId: 'class2',
    isPinned: false,
    startDate: new Date('2024-01-28'),
    endDate: new Date('2024-03-05'),
    createdAt: new Date('2024-01-28T14:00:00'),
  },
];

export const TeacherAnnouncements = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: '',
    targetAudience: 'student' as 'student' | 'parent' | 'all',
    isPinned: false,
    endDate: '',
  });

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || announcement.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Sort: pinned first, then by date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const totalPages = Math.ceil(sortedAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = sortedAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setFormData({
      title: '',
      content: '',
      classId: '',
      targetAudience: 'student',
      isPinned: false,
      endDate: '',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      classId: announcement.classId || '',
      targetAudience: Array.isArray(announcement.targetAudience)
        ? announcement.targetAudience[0] === 'student'
          ? 'student'
          : 'parent'
        : 'all',
      isPinned: announcement.isPinned,
      endDate: announcement.endDate ? announcement.endDate.toISOString().split('T')[0] : '',
    });
    setShowCreateModal(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteDialog(true);
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAnnouncements(
        announcements.map((a) =>
          a.id === announcement.id ? { ...a, isPinned: !a.isPinned } : a
        )
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Gagal mengubah status pin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const targetAudience: 'student'[] | 'parent'[] | 'all' =
        formData.targetAudience === 'all'
          ? 'all'
          : ([formData.targetAudience] as 'student'[] | 'parent'[]);

      if (selectedAnnouncement) {
        // Update existing announcement
        const updatedAnnouncement: Announcement = {
          ...selectedAnnouncement,
          title: formData.title,
          content: formData.content,
          classId: formData.classId || undefined,
          targetAudience,
          isPinned: formData.isPinned,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        };
        setAnnouncements(
          announcements.map((a) =>
            a.id === selectedAnnouncement.id ? updatedAnnouncement : a
          )
        );
      } else {
        // Create new announcement
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          title: formData.title,
          content: formData.content,
          authorId: user?.id || 'teacher1',
          targetAudience,
          classId: formData.classId || undefined,
          isPinned: formData.isPinned,
          startDate: new Date(),
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          createdAt: new Date(),
        };
        setAnnouncements([newAnnouncement, ...announcements]);
      }

      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        classId: '',
        targetAudience: 'student',
        isPinned: false,
        endDate: '',
      });
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Gagal menyimpan pengumuman');
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAnnouncements(announcements.filter((a) => a.id !== selectedAnnouncement.id));
      setShowDeleteDialog(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Gagal menghapus pengumuman');
    }
  };

  const getClassName = (classId?: string) => {
    if (!classId) return 'Semua Kelas';
    return MOCK_CLASSES.find((c) => c.value === classId)?.label || classId;
  };

  const getTargetAudienceLabel = (audience: Announcement['targetAudience']) => {
    if (audience === 'all') return 'Semua';
    if (Array.isArray(audience)) {
      if (audience.includes('student')) return 'Siswa';
      if (audience.includes('parent')) return 'Orang Tua';
    }
    return 'Semua';
  };

  return (
    <DashboardLayout>
      <div className="teacher-announcements">
        <div className="page-header">
          <h1>Pengumuman Kelas</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Buat Pengumuman
          </Button>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Kelas</option>
              {MOCK_CLASSES.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {paginatedAnnouncements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="Tidak Ada Pengumuman"
            message={selectedClass !== 'all'
              ? 'Tidak ada pengumuman yang sesuai dengan filter yang dipilih.'
              : 'Belum ada pengumuman yang dibuat.'}
            action={{
              label: 'Buat Pengumuman',
              onClick: handleCreate,
            }}
          />
        ) : (
          <div className="announcements-list">
            {paginatedAnnouncements.map((announcement) => (
              <Card key={announcement.id} variant="elevated" className="announcement-card">
                <div className="announcement-header">
                  <div className="announcement-header-content">
                    {announcement.isPinned && (
                      <Badge variant="warning" style={{ marginBottom: '0.5rem' }}>
                        <Icon name="star" size={14} style={{ marginRight: '0.25rem' }} />
                        Pinned
                      </Badge>
                    )}
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <div className="announcement-meta">
                      <span className="announcement-class">
                        <Icon name="userGroup" size={16} style={{ marginRight: '0.25rem' }} />
                        {getClassName(announcement.classId)}
                      </span>
                      <Badge variant="info" size="small">
                        {getTargetAudienceLabel(announcement.targetAudience)}
                      </Badge>
                      <span className="announcement-date">{getRelativeTime(announcement.createdAt)}</span>
                    </div>
                  </div>
                  <Dropdown
                    trigger={<Button variant="outline" size="small">⋯</Button>}
                    items={[
                      {
                        label: announcement.isPinned ? 'Lepas Pin' : 'Pin',
                        onClick: () => handleTogglePin(announcement),
                      },
                      { label: 'Edit', onClick: () => handleEdit(announcement) },
                      { divider: true },
                      { label: 'Hapus', onClick: () => handleDelete(announcement) },
                    ]}
                    align="right"
                  />
                </div>
                <div className="announcement-content">
                  <p>{announcement.content}</p>
                </div>
                {announcement.endDate && (
                  <div className="announcement-footer">
                    <span className="announcement-end-date">
                      <Icon name="calendar" size={16} style={{ marginRight: '0.25rem' }} />
                      Berlaku sampai: {formatDate(announcement.endDate)}
                    </span>
                  </div>
                )}
              </Card>
            ))}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              title: '',
              content: '',
              classId: '',
              targetAudience: 'student',
              isPinned: false,
              endDate: '',
            });
            setSelectedAnnouncement(null);
          }}
          title={selectedAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                />
                <span>Pin pengumuman (tampilkan di atas)</span>
              </label>
            </div>
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={[
                { value: '', label: 'Pilih kelas' },
                ...MOCK_CLASSES,
              ]}
              required
            />
            <FormSelect
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetAudience: e.target.value as 'student' | 'parent' | 'all',
                })
              }
              options={[
                { value: 'student', label: 'Siswa' },
                { value: 'parent', label: 'Orang Tua' },
                { value: 'all', label: 'Semua' },
              ]}
              required
            />
            <FormInput
              label="Judul Pengumuman"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul pengumuman"
              required
            />
            <FormTextarea
              label="Isi Pengumuman"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Masukkan isi pengumuman"
              rows={6}
              required
            />
            <FormInput
              label="Tanggal Berakhir (Opsional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    content: '',
                    classId: '',
                    targetAudience: 'student',
                    isPinned: false,
                    endDate: '',
                  });
                  setSelectedAnnouncement(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit">
                {selectedAnnouncement ? 'Simpan Perubahan' : 'Publikasikan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && selectedAnnouncement && (
          <div className="delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
            <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Hapus Pengumuman</h3>
              <p>
                Apakah Anda yakin ingin menghapus pengumuman "{selectedAnnouncement.title}"? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="dialog-actions">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
