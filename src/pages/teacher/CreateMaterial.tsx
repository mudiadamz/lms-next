import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput, FormSelect, FormTextarea, FileUpload, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import { MaterialType } from '../../types';
import './CreateMaterial.css';

export const CreateMaterial = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as MaterialType,
    subjectId: '',
    classId: '',
    externalUrl: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call materialService.createMaterial
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Gagal membuat materi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  { value: '1', label: 'Matematika' },
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
                { value: '1', label: 'X IPA 1' },
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

