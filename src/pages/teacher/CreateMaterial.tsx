import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FormTextarea, FileUpload, Modal, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { MaterialType } from '../../types';
import { materialService, subjectService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './CreateMaterial.css';

export const CreateMaterial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as MaterialType,
    subjectId: '',
    classId: '',
    externalUrl: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [subjectsData, classesData] = await Promise.all([
          subjectService.getSubjects(undefined, user?.id),
          classService.getClasses(),
        ]);
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await materialService.createMaterial({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: user?.id || '',
        externalUrl: formData.type === 'link' ? formData.externalUrl : undefined,
        fileUrl: formData.type !== 'link' && files.length > 0 ? files[0].name : undefined, // TODO: Handle actual file upload
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Gagal membuat materi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="create-material">
        <h1>Upload Materi Pembelajaran</h1>

        <Card>
          <form onSubmit={handleSubmit} className="material-form">
            <FormInput
              label="Judul Materi"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Masukkan judul materi"
            />

            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Masukkan deskripsi materi"
            />

            <div className="form-row">
              <FormSelect
                label="Tipe Materi"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as MaterialType })
                }
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
                label="Mata Pelajaran"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                options={[
                  { value: '', label: 'Pilih mata pelajaran' },
                  ...subjects,
                ]}
                required
              />
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

            {formData.type === 'link' ? (
              <FormInput
                label="URL"
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://example.com"
                required
              />
            ) : (
              <FileUpload
                label="File Materi"
                onFileSelect={setFiles}
                multiple={false}
                maxSize={50}
                accept={
                  formData.type === 'video'
                    ? 'video/*'
                    : formData.type === 'presentation'
                    ? '.ppt,.pptx'
                    : '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                }
              />
            )}

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.TEACHER_MATERIALS)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Upload Materi
              </Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(ROUTES.TEACHER_MATERIALS);
          }}
          title="Berhasil"
          size="small"
        >
          <p>Materi berhasil diupload!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

