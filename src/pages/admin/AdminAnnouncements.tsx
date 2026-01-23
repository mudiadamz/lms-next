import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, ConfirmDialog, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { Announcement, UserRole } from '../../types';
import { ROLE_LABELS } from '../../constants';
import { announcementService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './AdminAnnouncements.css';

export const AdminAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  {
    id: '1',
    title: 'Pengumuman Ujian Nasional 2024',
    content: 'Diberitahukan kepada seluruh siswa bahwa Ujian Nasional akan dilaksanakan pada tanggal 15-20 April 2024. Harap mempersiapkan diri dengan baik.',
    authorId: 'admin1',
    targetAudience: 'all',
    isPinned: true,
    createdAt: new Date('2024-01-10'),
    endDate: new Date('2024-04-20'),
  },
  {
    id: '2',
    title: 'Libur Semester Genap',
    content: 'Libur semester genap akan dimulai pada tanggal 1 Juli 2024 sampai dengan 15 Juli 2024. Selamat berlibur!',
    authorId: 'admin1',
    targetAudience: ['student'],
    isPinned: false,
    createdAt: new Date('2024-01-15'),
    endDate: new Date('2024-07-15'),
  },
  {
    id: '3',
    title: 'Rapat Orang Tua Siswa',
    content: 'Diharapkan kehadiran orang tua siswa kelas X untuk menghadiri rapat pada tanggal 25 Januari 2024 pukul 09:00 WIB.',
    authorId: 'admin1',
    targetAudience: ['parent'],
    classId: 'class1',
    isPinned: false,
    createdAt: new Date('2024-01-20'),
    endDate: new Date('2024-01-25'),
  },
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as UserRole[] | 'all',
    classId: '',
    isPinned: false,
    endDate: '',
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [announcementsData, classesData] = await Promise.all([
          announcementService.getAnnouncements(),
          classService.getClasses(),
        ]);

        setAnnouncements(announcementsData);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Gagal memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (date: Date | undefined | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience =
      selectedAudience === 'all' ||
      announcement.targetAudience === 'all' ||
      (Array.isArray(announcement.targetAudience) &&
        announcement.targetAudience.includes(selectedAudience as UserRole));
    return matchesSearch && matchesAudience;
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
      targetAudience: 'all',
      classId: '',
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
      targetAudience: announcement.targetAudience,
      classId: announcement.classId || '',
      isPinned: announcement.isPinned,
      endDate: announcement.endDate
        ? announcement.endDate.toISOString().split('T')[0]
        : '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteDialog(true);
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      setIsSubmitting(true);
      const updated = await announcementService.updateAnnouncement(announcement.id, {
        isPinned: !announcement.isPinned,
      });
      setAnnouncements(
        announcements.map((a) =>
          a.id === announcement.id ? updated : a
        )
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengubah status pin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const announcementData = {
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience,
        classId: formData.classId || undefined,
        isPinned: formData.isPinned,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      if (showEditModal && selectedAnnouncement) {
        // Update existing announcement
        const updated = await announcementService.updateAnnouncement(selectedAnnouncement.id, announcementData);
        setAnnouncements(
          announcements.map((a) =>
            a.id === selectedAnnouncement.id ? updated : a
          )
        );
      } else {
        // Create new announcement
        const newAnnouncement = await announcementService.createAnnouncement(announcementData);
        setAnnouncements([...announcements, newAnnouncement]);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        title: '',
        content: '',
        targetAudience: 'all',
        classId: '',
        isPinned: false,
        endDate: '',
      });
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      setIsSubmitting(true);
      await announcementService.deleteAnnouncement(selectedAnnouncement.id);
      setAnnouncements(announcements.filter((a) => a.id !== selectedAnnouncement.id));
      setShowDeleteDialog(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetAudienceLabel = (audience: UserRole[] | 'all') => {
    if (audience === 'all') return 'Semua';
    if (audience.length === 1) return ROLE_LABELS[audience[0]];
    return audience.map((role) => ROLE_LABELS[role]).join(', ');
  };

  const columns = [
    {
      key: 'title',
      header: 'Judul',
      render: (item: Announcement) => (
        <div>
          {item.isPinned && (
            <Icon name="star" size={16} style={{ marginRight: '0.5rem', color: '#fbbf24' }} />
          )}
          <strong>{item.title}</strong>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Isi',
      render: (item: Announcement) => (
        <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.content}
        </div>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Target',
      render: (item: Announcement) => (
        <Badge variant="secondary">{getTargetAudienceLabel(item.targetAudience)}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item: Announcement) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Announcement) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            { label: item.isPinned ? 'Lepas Pin' : 'Pin', onClick: () => handleTogglePin(item) },
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
      <div className="admin-announcements">
        <div className="page-header">
          <h1>Pengumuman Sekolah</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Buat Pengumuman
          </Button>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <select
              value={selectedAudience}
              onChange={(e) => {
                setSelectedAudience(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Target</option>
              <option value="all">Semua</option>
              <option value="student">Siswa</option>
              <option value="teacher">Guru</option>
              <option value="parent">Orang Tua</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : paginatedAnnouncements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="Tidak Ada Pengumuman"
            message={selectedAudience !== 'all'
              ? 'Tidak ada pengumuman yang sesuai dengan filter yang dipilih.'
              : 'Belum ada pengumuman yang dibuat.'}
            action={{
              label: 'Buat Pengumuman',
              onClick: handleCreate,
            }}
          />
        ) : (
          <Card title={`Daftar Pengumuman (${sortedAnnouncements.length})`} variant="elevated">
            <Table columns={columns} data={paginatedAnnouncements} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              title: '',
              content: '',
              targetAudience: 'all',
              classId: '',
              isPinned: false,
              endDate: '',
            });
          }}
          title="Buat Pengumuman"
          size="large"
        >
          <form onSubmit={handleSubmit} className="announcement-form">
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
            <FormSelect
              label="Target Audience"
              value={
                formData.targetAudience === 'all'
                  ? 'all'
                  : Array.isArray(formData.targetAudience)
                  ? formData.targetAudience[0]
                  : 'all'
              }
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  targetAudience: value === 'all' ? 'all' : [value as UserRole],
                });
              }}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'student', label: 'Siswa' },
                { value: 'teacher', label: 'Guru' },
                { value: 'parent', label: 'Orang Tua' },
                { value: 'admin', label: 'Admin' },
              ]}
              required
            />
            {formData.targetAudience !== 'all' && (
              <FormSelect
                label="Kelas (Opsional)"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { value: '', label: 'Semua Kelas' },
                  ...classes,
                ]}
              />
            )}
            <FormInput
              label="Tanggal Berakhir (Opsional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
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
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Publikasikan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAnnouncement(null);
          }}
          title="Edit Pengumuman"
          size="large"
        >
          <form onSubmit={handleSubmit} className="announcement-form">
            <FormInput
              label="Judul Pengumuman"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <FormTextarea
              label="Isi Pengumuman"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />
            <FormSelect
              label="Target Audience"
              value={
                formData.targetAudience === 'all'
                  ? 'all'
                  : Array.isArray(formData.targetAudience)
                  ? formData.targetAudience[0]
                  : 'all'
              }
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  targetAudience: value === 'all' ? 'all' : [value as UserRole],
                });
              }}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'student', label: 'Siswa' },
                { value: 'teacher', label: 'Guru' },
                { value: 'parent', label: 'Orang Tua' },
                { value: 'admin', label: 'Admin' },
              ]}
              required
            />
            {formData.targetAudience !== 'all' && (
              <FormSelect
                label="Kelas (Opsional)"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { value: '', label: 'Semua Kelas' },
                  ...classes,
                ]}
              />
            )}
            <FormInput
              label="Tanggal Berakhir (Opsional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
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
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedAnnouncement(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Pengumuman"
          message={`Apakah Anda yakin ingin menghapus pengumuman "${selectedAnnouncement?.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};
