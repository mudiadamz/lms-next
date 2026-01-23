import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Loading, EmptyState } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { userService, classService } from '../../services';
import './ParentChildProfile.css';

export const ParentChildProfile = () => {
  const { user } = useAuth();
  const [child, setChild] = useState<any>(null);
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const parentData = await userService.getUserById(user.id);
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get first child
        const childData = await userService.getUserById(studentIds[0]);
        setChild(childData);

        // Get class name
        const classId = (childData as any)?.classId;
        if (classId) {
          const classInfo = await classService.getClassById(classId);
          setClassName(classInfo.name);
        }
      } catch (error) {
        console.error('Error loading child profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout>
        <EmptyState icon="user" title="Tidak Ada Data Anak" message="Belum ada data anak yang terdaftar." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="parent-child-profile">
        <h1>Profil Anak</h1>
        <Card title="Informasi Anak" variant="elevated">
          <div className="child-info">
            <div className="info-row">
              <span className="info-label">Nama:</span>
              <span className="info-value">{child.fullName}</span>
            </div>
            {child.studentNumber && (
              <div className="info-row">
                <span className="info-label">NIS:</span>
                <span className="info-value">{child.studentNumber}</span>
              </div>
            )}
            {className && (
              <div className="info-row">
                <span className="info-label">Kelas:</span>
                <span className="info-value">{className}</span>
              </div>
            )}
            {child.email && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{child.email}</span>
              </div>
            )}
            {child.phoneNumber && (
              <div className="info-row">
                <span className="info-label">No. HP:</span>
                <span className="info-value">{child.phoneNumber}</span>
              </div>
            )}
            {child.gender && (
              <div className="info-row">
                <span className="info-label">Jenis Kelamin:</span>
                <span className="info-value">{child.gender}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

