import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FormTextarea, FileUpload, Modal, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { assignmentService, subjectService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './CreateAssignment.css';

export const CreateAssignment = () => {
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
    subjectId: '',
    classId: '',
    startDate: '',
    dueDate: '',
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
      await assignmentService.createAssignment({
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: user?.id || '',
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        maxScore: 100,
        attachments: [], // TODO: Handle file uploads
      });
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

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
                  ...subjects,
                ]}
                required
              />

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
            </div>

            <div className="form-row">
              <FormInput
                label="Waktu Mulai"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormInput
                label="Deadline"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
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

