import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { SCHOOL_LEVELS, ROLE_LABELS } from '../../constants';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import './ParentProfile.css';

export const ParentProfile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="parent-profile">
        <h1>Profil Saya</h1>
        
        {/* Avatar Section */}
        {user?.avatar && (
          <Card variant="elevated" className="profile-avatar-card">
            <div className="profile-avatar">
              <img src={user.avatar} alt={user.fullName} />
            </div>
          </Card>
        )}

        {/* Informasi Pribadi */}
        <Card title="Informasi Pribadi" variant="elevated">
          <div className="profile-info">
            <div className="info-item">
              <strong>Nama Lengkap:</strong> 
              <span>{user?.fullName || '-'}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong> 
              <span>{user?.email || '-'}</span>
            </div>
            <div className="info-item">
              <strong>Nomor Telepon:</strong> 
              <span>{user?.phoneNumber || '-'}</span>
            </div>
            <div className="info-item">
              <strong>Tempat Lahir:</strong> 
              <span>{user?.birthPlace || '-'}</span>
            </div>
            <div className="info-item">
              <strong>Tanggal Lahir:</strong> 
              <span>{user?.birthDate ? formatDate(user.birthDate) : '-'}</span>
            </div>
            <div className="info-item">
              <strong>Alamat:</strong> 
              <span>{user?.address || '-'}</span>
            </div>
          </div>
        </Card>

        {/* Informasi Akun */}
        <Card title="Informasi Akun" variant="elevated">
          <div className="profile-info">
            <div className="info-item">
              <strong>Role:</strong> 
              <span>{user?.role ? ROLE_LABELS[user.role] : '-'}</span>
            </div>
            <div className="info-item">
              <strong>Jenjang Sekolah:</strong> 
              <span>{user?.schoolLevel ? SCHOOL_LEVELS[user.schoolLevel] : '-'}</span>
            </div>
            <div className="info-item">
              <strong>ID Siswa (Anak):</strong> 
              <span>{user?.studentId || '-'}</span>
            </div>
            <div className="info-item">
              <strong>ID Pengguna:</strong> 
              <span>{user?.id || '-'}</span>
            </div>
          </div>
        </Card>

        {/* Dokumen */}
        {(user?.photoFile || user?.ktpFile || user?.kkFile) && (
          <Card title="Dokumen" variant="elevated">
            <div className="profile-info">
              {user?.photoFile && (
                <div className="info-item">
                  <strong>Foto:</strong> 
                  <span className="file-link">
                    <Icon name="document" size={16} style={{ marginRight: '0.5rem' }} />
                    {user.photoFile}
                  </span>
                </div>
              )}
              {user?.ktpFile && (
                <div className="info-item">
                  <strong>KTP:</strong> 
                  <span className="file-link">
                    <Icon name="document" size={16} style={{ marginRight: '0.5rem' }} />
                    {user.ktpFile}
                  </span>
                </div>
              )}
              {user?.kkFile && (
                <div className="info-item">
                  <strong>KK:</strong> 
                  <span className="file-link">
                    <Icon name="document" size={16} style={{ marginRight: '0.5rem' }} />
                    {user.kkFile}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Informasi Sistem */}
        <Card title="Informasi Sistem" variant="elevated">
          <div className="profile-info">
            <div className="info-item">
              <strong>Dibuat pada:</strong> 
              <span>{user?.createdAt ? formatDateTime(user.createdAt) : '-'}</span>
            </div>
            <div className="info-item">
              <strong>Diperbarui pada:</strong> 
              <span>{user?.updatedAt ? formatDateTime(user.updatedAt) : '-'}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
