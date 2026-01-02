import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, Icon } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import './AdminClasses.css';

// Mock data untuk dropdowns
const MOCK_TEACHERS = [
  { value: 'teacher1', label: 'Ibu Siti' },
  { value: 'teacher2', label: 'Bapak Budi' },
  { value: 'teacher3', label: 'Ibu Rina' },
  { value: 'teacher4', label: 'Bapak Andi' },
];

const MOCK_ACADEMIC_YEARS = [
  { value: '2024-2025', label: '2024-2025' },
  { value: '2023-2024', label: '2023-2024' },
  { value: '2022-2023', label: '2022-2023' },
];

const GRADE_OPTIONS = [
  { value: '1', label: 'Kelas 1' },
  { value: '2', label: 'Kelas 2' },
  { value: '3', label: 'Kelas 3' },
  { value: '4', label: 'Kelas 4' },
  { value: '5', label: 'Kelas 5' },
  { value: '6', label: 'Kelas 6' },
  { value: '7', label: 'Kelas 7' },
  { value: '8', label: 'Kelas 8' },
  { value: '9', label: 'Kelas 9' },
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
];

export const AdminClassesCreate = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    schoolLevel: '',
    homeroomTeacherId: '',
    academicYear: '',
    semester: '1',
    maxStudents: '36',
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newClass = {
        id: Date.now().toString(),
        name: formData.name,
        grade: parseInt(formData.grade),
        schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma',
        homeroomTeacherId: formData.homeroomTeacherId,
        academicYear: formData.academicYear,
        semester: parseInt(formData.semester),
        studentIds: [],
        subjectIds: [],
      };

      // TODO: Call classService.createClass
      console.log('Creating class:', newClass);

      // Navigate back to classes list
      navigate(ROUTES.ADMIN_CLASSES);
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Gagal menambah kelas');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-classes-create">
        <div className="page-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_CLASSES)}>
            <Icon name="chevronLeft" size={20} /> Kembali
          </Button>
          <h1>Tambah Kelas Baru</h1>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleCreateClass} className="add-class-form">
            <FormInput
              label="Nama Kelas"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: X IPA 1, VII A, Kelas 1A"
              required
            />

            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: '', label: 'Pilih tingkat sekolah' },
                { value: 'sd', label: SCHOOL_LEVELS.sd },
                { value: 'smp', label: SCHOOL_LEVELS.smp },
                { value: 'sma', label: SCHOOL_LEVELS.sma },
              ]}
              required
            />

            {formData.schoolLevel && (
              <FormSelect
                label="Kelas"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                options={[
                  { value: '', label: 'Pilih kelas' },
                  ...GRADE_OPTIONS.filter((opt) => {
                    const gradeNum = parseInt(opt.value);
                    if (formData.schoolLevel === 'sd') return gradeNum >= 1 && gradeNum <= 6;
                    if (formData.schoolLevel === 'smp') return gradeNum >= 7 && gradeNum <= 9;
                    if (formData.schoolLevel === 'sma') return gradeNum >= 10 && gradeNum <= 12;
                    return false;
                  }),
                ]}
                required
              />
            )}

            <FormSelect
              label="Wali Kelas"
              value={formData.homeroomTeacherId}
              onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih wali kelas' },
                ...MOCK_TEACHERS,
              ]}
              required
            />

            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={[
                { value: '', label: 'Pilih tahun ajaran' },
                ...MOCK_ACADEMIC_YEARS,
              ]}
              required
            />

            <div className="form-row">
              <FormSelect
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                options={[
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                ]}
                required
              />

              <FormInput
                label="Maksimal Siswa"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                placeholder="36"
                min="1"
                max="50"
                required
              />
            </div>

            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_CLASSES)} disabled={isCreating}>
                Batal
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Tambah Kelas
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

