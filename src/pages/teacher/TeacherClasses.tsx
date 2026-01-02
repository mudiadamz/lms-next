import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, SearchBar, Badge, Icon, EmptyState } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import './TeacherClasses.css';

// Interface untuk kelas yang diajar guru
interface TeacherClass {
  id: string;
  name: string;
  grade: number;
  schoolLevel: 'sd' | 'smp' | 'sma';
  studentCount: number;
  maxStudents: number;
  subjects: string[]; // Mata pelajaran yang diajar di kelas ini
  academicYear: string;
  semester: number;
}

// Contoh data kelas yang diajar oleh guru
const mockTeacherClasses: TeacherClass[] = [
  {
    id: 'class1',
    name: 'X IPA 1',
    grade: 10,
    schoolLevel: 'sma',
    studentCount: 30,
    maxStudents: 36,
    subjects: ['Matematika', 'Fisika'],
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: 'class2',
    name: 'X IPA 2',
    grade: 10,
    schoolLevel: 'sma',
    studentCount: 28,
    maxStudents: 36,
    subjects: ['Matematika'],
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: 'class3',
    name: 'XI IPA 1',
    grade: 11,
    schoolLevel: 'sma',
    studentCount: 32,
    maxStudents: 36,
    subjects: ['Fisika', 'Kimia'],
    academicYear: '2024-2025',
    semester: 1,
  },
];

export const TeacherClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredClasses = mockTeacherClasses.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevel === 'all' || cls.schoolLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleViewClass = (classId: string) => {
    navigate(`${ROUTES.TEACHER_CLASSES_DETAIL.replace(':id', classId)}`);
  };

  const handleManageClass = (classId: string) => {
    navigate(`${ROUTES.TEACHER_CLASSES_MANAGE.replace(':id', classId)}`);
  };

  return (
    <DashboardLayout>
      <div className="teacher-classes">
        <div className="page-header">
          <div>
            <h1>Kelas yang Diajar</h1>
            <p className="page-subtitle">
              Kelola kelas dan mata pelajaran yang Anda ajar
            </p>
          </div>
        </div>

        <div className="page-filters">
          <SearchBar
            placeholder="Cari kelas atau mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Tingkat</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
            </select>
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Kelas"
            message={searchTerm || selectedLevel !== 'all'
              ? 'Tidak ada kelas yang sesuai dengan filter yang dipilih.'
              : 'Anda belum memiliki kelas yang diajar.'}
          />
        ) : (
          <div className="classes-grid">
            {filteredClasses.map((classItem) => (
              <Card key={classItem.id} variant="elevated" className="class-card">
                <div className="class-card-header">
                  <div>
                    <h3 className="class-name">{classItem.name}</h3>
                    <Badge variant="secondary" style={{ marginTop: '0.25rem' }}>
                      {SCHOOL_LEVELS[classItem.schoolLevel]}
                    </Badge>
                  </div>
                  <Badge
                    variant={classItem.studentCount >= classItem.maxStudents ? 'danger' : 'primary'}
                  >
                    {classItem.studentCount}/{classItem.maxStudents}
                  </Badge>
                </div>

                <div className="class-info">
                  <div className="info-item">
                    <Icon name="users" size={18} />
                    <span>{classItem.studentCount} siswa</span>
                  </div>
                  <div className="info-item">
                    <Icon name="book" size={18} />
                    <span>{classItem.subjects.length} mata pelajaran</span>
                  </div>
                  <div className="info-item">
                    <Icon name="calendar" size={18} />
                    <span>{classItem.academicYear} - Semester {classItem.semester}</span>
                  </div>
                </div>

                <div className="class-subjects">
                  <strong>Mata Pelajaran:</strong>
                  <div className="subjects-list">
                    {classItem.subjects.map((subject, index) => (
                      <Badge key={index} variant="secondary" size="small">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="class-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleViewClass(classItem.id)}
                    style={{ flex: 1 }}
                  >
                    <Icon name="eye" size={16} style={{ marginRight: '0.5rem' }} />
                    Detail
                  </Button>
                  <Button
                    onClick={() => handleManageClass(classItem.id)}
                    style={{ flex: 1 }}
                  >
                    <Icon name="settings" size={16} style={{ marginRight: '0.5rem' }} />
                    Kelola
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
