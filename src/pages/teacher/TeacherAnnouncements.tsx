import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { Announcement } from '../../types';
import { formatDate, getRelativeTime } from '../../utils';
import { announcementService, classService } from '../../services';
import './TeacherAnnouncements.css';

export const TeacherAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [announcementsData, classesData] = await Promise.all([
          announcementService.getAnnouncements({ targetAudience: 'student' }),
          classService.getClasses(),
        ]);

        // Filter announcements by teacher's classes
        const teacherClasses = classesData.map(c => c.id);
        const filtered = announcementsData.filter(a => 
          a.authorId === user?.id || (a.classId && teacherClasses.includes(a.classId))
        );

        setAnnouncements(filtered);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

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
    
    // Safely convert to Date objects if needed
    const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    
    if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
      return 0; // If dates are invalid, don't change order
    }
    
    return bDate.getTime() - aDate.getTime();
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

      const targetAudience: 'student'[] | 'parent'[] | 'all' =
        formData.targetAudience === 'all'
          ? 'all'
          : ([formData.targetAudience] as 'student'[] | 'parent'[]);

      const announcementData = {
        title: formData.title,
        content: formData.content,
        classId: formData.classId || undefined,
        targetAudience,
        isPinned: formData.isPinned,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      if (selectedAnnouncement) {
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

  const getClassName = (classId?: string) => {
    if (!classId) return 'Semua Kelas';
    return classes.find((c) => c.value === classId)?.label || classId;
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
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : paginatedAnnouncements.length === 0 ? (
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
                ...classes,
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : (selectedAnnouncement ? 'Simpan Perubahan' : 'Publikasikan')}
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
