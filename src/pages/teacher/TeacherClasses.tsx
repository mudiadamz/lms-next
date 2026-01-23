import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, EmptyState, Loading } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import { classService, subjectService } from '../../services';
import './TeacherClasses.css';

export const TeacherClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        // Filter classes taught by this teacher
        const teacherClasses = classesData.filter(c => {
          const teacherIds = (c as any).teacherIds || [];
          return teacherIds.includes(user?.id);
        });

        setClasses(teacherClasses);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const filteredClasses = classes.filter((cls) => {
    const matchesLevel = selectedLevel === 'all' || cls.schoolLevel === selectedLevel;
    return matchesLevel;
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

        {isLoading ? (
          <Loading />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Kelas"
            message={selectedLevel !== 'all'
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
                    variant={(classItem as any).studentCount >= (classItem as any).maxStudents ? 'danger' : 'primary'}
                  >
                    {(classItem as any).studentCount || 0}/{(classItem as any).maxStudents || 0}
                  </Badge>
                </div>

                <div className="class-info">
                  <div className="info-item">
                    <Icon name="users" size={18} />
                    <span>{(classItem as any).studentCount || 0} siswa</span>
                  </div>
                  <div className="info-item">
                    <Icon name="book" size={18} />
                    <span>{(classItem as any).subjects?.length || 0} mata pelajaran</span>
                  </div>
                  {(classItem as any).academicYear && (
                    <div className="info-item">
                      <Icon name="calendar" size={18} />
                      <span>{(classItem as any).academicYear} - Semester {(classItem as any).semester || 1}</span>
                    </div>
                  )}
                </div>

                {(classItem as any).subjects && (classItem as any).subjects.length > 0 && (
                  <div className="class-subjects">
                    <strong>Mata Pelajaran:</strong>
                    <div className="subjects-list">
                      {(classItem as any).subjects.map((subjectId: string, index: number) => (
                        <Badge key={index} variant="secondary" size="small">
                          {subjects[subjectId] || subjectId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
            message={selectedLevel !== 'all'
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
