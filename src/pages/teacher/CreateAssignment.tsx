import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput, FormSelect, FormTextarea, FileUpload, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import './CreateAssignment.css';

export const CreateAssignment = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    dueDate: '',
    maxScore: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call assignmentService.createAssignment
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Gagal membuat tugas. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.TEACHER_ASSIGNMENTS);
  };

  return (
    <DashboardLayout>
      <div className="create-assignment">
        <h1>Buat Tugas Baru</h1>

        <Card>
          <form onSubmit={handleSubmit} className="assignment-form">
            <FormInput
              label="Judul Tugas"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Masukkan judul tugas"
            />

            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Masukkan deskripsi tugas"
              rows={5}
            />

            <div className="form-row">
              <FormSelect
                label="Mata Pelajaran"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                options={[
                  { value: '', label: 'Pilih mata pelajaran' },
                  { value: '1', label: 'Matematika' },
                  { value: '2', label: 'Bahasa Indonesia' },
                ]}
                required
              />

              <FormSelect
                label="Kelas"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { value: '', label: 'Pilih kelas' },
                  { value: '1', label: 'X IPA 1' },
                  { value: '2', label: 'X IPA 2' },
                ]}
                required
              />
            </div>

            <div className="form-row">
              <FormInput
                label="Deadline"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />

              <FormInput
                label="Nilai Maksimal"
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                required
                min="1"
                placeholder="100"
              />
            </div>

            <FileUpload
              label="Lampiran (Opsional)"
              onFileSelect={setFiles}
              multiple
              maxFiles={5}
              maxSize={10}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENTS)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Buat Tugas
              </Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={showSuccessModal}
          onClose={handleSuccess}
          title="Berhasil"
          size="small"
        >
          <p>Tugas berhasil dibuat!</p>
          <div className="modal-footer">
            <Button onClick={handleSuccess}>OK</Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

