import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput, FormSelect, FormTextarea, FileUpload } from '../../components/common';
import { ROUTES } from '../../constants';
import './EditAssignment.css';

export const EditAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    dueDate: '',
    maxScore: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // TODO: Fetch assignment data
    const loadAssignment = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setFormData({
          title: 'Tugas Matematika - Aljabar',
          description: 'Kerjakan soal-soal aljabar berikut dengan benar.',
          subjectId: '1',
          classId: '1',
          dueDate: '2024-01-20T23:59',
          maxScore: '100',
        });
      } catch (error) {
        console.error('Error loading assignment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Call assignmentService.updateAssignment
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        <div>Loading...</div>
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

