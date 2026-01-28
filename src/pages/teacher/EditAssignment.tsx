import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Loading, EmptyState } from '../../components/common';
import { FormInput, FormSelect, FormTextarea, FileUpload } from '../../components/common';
import { ROUTES } from '../../constants';
import { assignmentService, subjectService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './EditAssignment.css';

export const EditAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    startDate: '',
    dueDate: '',
    maxScore: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [assignmentData, subjectsData, classesData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          subjectService.getSubjects(undefined, user?.id),
          classService.getClasses(),
        ]);

        setFormData({
          title: assignmentData.title,
          description: assignmentData.description,
          subjectId: assignmentData.subjectId,
          classId: assignmentData.classId,
          startDate: new Date(assignmentData.startDate || assignmentData.createdAt).toISOString().slice(0, 16),
          dueDate: new Date(assignmentData.dueDate).toISOString().slice(0, 16),
          maxScore: assignmentData.maxScore.toString(),
        });

        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error('Error loading assignment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);

    try {
      await assignmentService.updateAssignment(id, {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
        maxScore: parseFloat(formData.maxScore),
      });
      navigate(`${ROUTES.TEACHER_ASSIGNMENTS}/${id}`);
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Gagal mengupdate tugas. Silakan coba lagi.');
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
      <div className="edit-assignment">
        <h1>Edit Tugas</h1>

        <Card>
          <form onSubmit={handleSubmit} className="assignment-form">
            <FormInput
              label="Judul Tugas"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
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

              <FormInput
                label="Nilai Maksimal"
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                required
                min="1"
              />
            </div>

            <FileUpload
              label="Lampiran (Opsional)"
              onFileSelect={setFiles}
              multiple
              maxFiles={5}
              maxSize={10}
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`${ROUTES.TEACHER_ASSIGNMENTS}/${id}`)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

