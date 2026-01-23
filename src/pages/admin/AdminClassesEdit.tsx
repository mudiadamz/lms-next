import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, Icon, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { classService, userService, academicYearService } from '../../services';
import './AdminClasses.css';

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

export const AdminClassesEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Array<{ value: string; label: string }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    schoolLevel: '',
    homeroomTeacherId: '',
    academicYear: '',
    semester: '1',
    maxStudents: '36',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [classData, teachersData, academicYearsData] = await Promise.all([
          classService.getClassById(id),
          userService.getUsers('teacher'),
          academicYearService.getAcademicYears(),
        ]);

        setFormData({
          name: classData.name,
          grade: classData.grade.toString(),
          schoolLevel: classData.schoolLevel,
          homeroomTeacherId: classData.homeroomTeacherId || '',
          academicYear: classData.academicYear,
          semester: classData.semester.toString(),
          maxStudents: '36', // Default, not in schema
        });

        setTeachers(teachersData.map(t => ({ value: t.id, label: t.fullName })));
        setAcademicYears(academicYearsData.map(ay => ({ value: ay.name, label: ay.name })));
      } catch (error) {
        console.error('Error loading class data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsUpdating(true);

    try {
      await classService.updateClass(id, {
        name: formData.name,
        grade: parseInt(formData.grade),
        schoolLevel: formData.schoolLevel as 'sd' | 'smp' | 'sma',
        homeroomTeacherId: formData.homeroomTeacherId || undefined,
        academicYear: formData.academicYear,
        semester: parseInt(formData.semester),
      });

      navigate(ROUTES.ADMIN_CLASSES);
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Gagal mengupdate kelas');
    } finally {
      setIsUpdating(false);
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
      <div className="admin-classes-create">
        <div className="page-header">
          <h1>Edit Kelas</h1>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleUpdateClass} className="add-class-form">
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
                ...teachers,
              ]}
              required
            />

            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={[
                { value: '', label: 'Pilih tahun ajaran' },
                ...academicYears,
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
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_CLASSES)} disabled={isUpdating}>
                Batal
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

