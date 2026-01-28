import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState, Modal, FormInput, FormSelect, FormTextarea, ConfirmDialog, FileUpload } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, getFileUrl } from '../../utils';
import { materialService, classService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherMaterials.css';

export const TeacherMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    subjectId: '',
    classId: '',
    externalUrl: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [materialsData, classesData, subjectsData] = await Promise.all([
          materialService.getMaterials(),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        // Filter materials by teacher
        const teacherMaterials = materialsData.filter(m => m.teacherId === user?.id);
        setMaterials(teacherMaterials);
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setEditFormData({
      title: material.title || '',
      description: material.description || '',
      type: material.type || 'document',
      subjectId: material.subjectId || '',
      classId: material.classId || '',
      externalUrl: material.externalUrl || '',
    });
    setEditFiles([]);
    setShowEditModal(true);
  };

  const handleDetail = (material: any) => {
    setDetailMaterial(material);
    setShowDetailModal(true);
  };

  const handleDelete = (material: any) => {
    setSelectedMaterial(material);
    setShowDeleteDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    try {
      setIsSubmitting(true);
      const payload: any = {
        title: editFormData.title,
        description: editFormData.description,
        type: editFormData.type,
        subjectId: editFormData.subjectId,
        classId: editFormData.classId,
      };
      if (editFormData.type === 'link') {
        payload.externalUrl = editFormData.externalUrl;
      } else {
        payload.externalUrl = undefined;
        if (editFiles.length > 0) {
          payload.fileUrl = editFiles[0].name;
        }
      }
      const updated = await materialService.updateMaterial(selectedMaterial.id, payload);
      setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowEditModal(false);
      setSelectedMaterial(null);
      setEditFiles([]);
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Gagal mengupdate materi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMaterial) return;
    try {
      setIsSubmitting(true);
      await materialService.deleteMaterial(selectedMaterial.id);
      setMaterials((prev) => prev.filter((m) => m.id !== selectedMaterial.id));
      setShowDeleteDialog(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Gagal menghapus materi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="teacher-materials">
        <div className="page-header">
          <h1>Materi Pembelajaran</h1>
          <Link to={ROUTES.TEACHER_MATERIALS_CREATE}>
            <Button>Upload Materi</Button>
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : materials.length === 0 ? (
          <EmptyState
            icon="document"
            title="Tidak Ada Materi"
            message="Belum ada materi pembelajaran yang diupload."
          />
        ) : (
          <div className="materials-grid">
            {materials.map((material) => (
              <Card key={material.id} title={material.title} variant="elevated">
                <div className="material-info">
                  <Badge variant="primary">{material.type || 'document'}</Badge>
                  <p>Kelas: {classes[material.classId] || material.classId}</p>
                  <p>Mata Pelajaran: {subjects[material.subjectId] || material.subjectId}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Dibuat: {formatDate(new Date(material.createdAt || material.date || Date.now()))}
                  </p>
                </div>
                <div className="material-actions">
                  <Button variant="outline" size="small" onClick={() => handleDetail(material)}>
                    Detail
                  </Button>
                  <Button variant="outline" size="small" onClick={() => handleEdit(material)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="small" onClick={() => handleDelete(material)}>
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMaterial(null);
            setEditFiles([]);
          }}
          title="Edit Materi"
          size="large"
        >
          <form onSubmit={handleUpdate} className="material-form">
            <FormInput
              label="Judul Materi"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />
            <FormTextarea
              label="Deskripsi"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={4}
            />
            <div className="form-row">
              <FormSelect
                label="Tipe Materi"
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                options={[
                  { value: 'document', label: 'Dokumen' },
                  { value: 'video', label: 'Video' },
                  { value: 'presentation', label: 'Presentasi' },
                  { value: 'link', label: 'Link' },
                  { value: 'other', label: 'Lainnya' },
                ]}
                required
              />
              <FormSelect
                label="Kelas"
                value={editFormData.classId}
                onChange={(e) => setEditFormData({ ...editFormData, classId: e.target.value })}
                options={Object.entries(classes).map(([value, label]) => ({ value, label }))}
                required
              />
            </div>
            <FormSelect
              label="Mata Pelajaran"
              value={editFormData.subjectId}
              onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
              options={Object.entries(subjects).map(([value, label]) => ({ value, label }))}
              required
            />
            {editFormData.type === 'link' && (
              <FormInput
                label="Link Materi"
                value={editFormData.externalUrl}
                onChange={(e) => setEditFormData({ ...editFormData, externalUrl: e.target.value })}
                placeholder="https://"
                required
              />
            )}
            {editFormData.type !== 'link' && (
              <FileUpload
                label="Ganti File Materi"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4"
                maxSize={10}
                onFileSelect={(files) => setEditFiles(files)}
                multiple={false}
              />
            )}
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

        <Modal
          isOpen={showDetailModal && !!detailMaterial}
          onClose={() => {
            setShowDetailModal(false);
            setDetailMaterial(null);
          }}
          title="Detail Materi"
          size="large"
        >
          {detailMaterial && (
            <div className="material-detail">
              <div className="material-detail-row">
                <span className="material-detail-label">Judul</span>
                <span className="material-detail-value">{detailMaterial.title || '-'}</span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Deskripsi</span>
                <span className="material-detail-value">{detailMaterial.description || '-'}</span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Tipe</span>
                <span className="material-detail-value">{detailMaterial.type || '-'}</span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Kelas</span>
                <span className="material-detail-value">
                  {classes[detailMaterial.classId] || detailMaterial.classId || '-'}
                </span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Mata Pelajaran</span>
                <span className="material-detail-value">
                  {subjects[detailMaterial.subjectId] || detailMaterial.subjectId || '-'}
                </span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Dibuat</span>
                <span className="material-detail-value">
                  {formatDate(new Date(detailMaterial.createdAt || detailMaterial.date || Date.now()))}
                </span>
              </div>
              <div className="material-detail-row">
                <span className="material-detail-label">Materi</span>
                <span className="material-detail-value">
                  {detailMaterial.type === 'link' && detailMaterial.externalUrl ? (
                    <a href={detailMaterial.externalUrl} target="_blank" rel="noreferrer">
                      Buka Link
                    </a>
                  ) : detailMaterial.fileUrl ? (
                    <a href={getFileUrl(detailMaterial.fileUrl)} target="_blank" rel="noreferrer">
                      Unduh/Lihat File
                    </a>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              {detailMaterial.type !== 'link' && detailMaterial.fileUrl && (
                <div className="material-detail-preview">
                  {detailMaterial.fileUrl.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                    <img src={detailMaterial.fileUrl} alt={detailMaterial.title} />
                  ) : null}
                </div>
              )}
            </div>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedMaterial(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Materi"
          message={`Apakah Anda yakin ingin menghapus materi "${selectedMaterial?.title}"?`}
          confirmLabel={isSubmitting ? 'Menghapus...' : 'Hapus'}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};

