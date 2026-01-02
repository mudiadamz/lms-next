import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, SearchBar, EmptyState, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './ParentMessages.css';

const mockMessages = [
  {
    id: '1',
    from: 'Ibu Siti',
    fromRole: 'Wali Kelas',
    subject: 'Perkembangan Anak',
    preview: 'Anak Anda menunjukkan perkembangan yang baik dalam mata pelajaran Matematika...',
    date: new Date('2024-01-18'),
    isRead: false,
  },
  {
    id: '2',
    from: 'Bapak Budi',
    fromRole: 'Guru Bahasa Indonesia',
    subject: 'Tugas yang Belum Dikumpulkan',
    preview: 'Mohon perhatian, ada beberapa tugas yang belum dikumpulkan oleh anak Anda...',
    date: new Date('2024-01-15'),
    isRead: true,
  },
];

export const ParentMessages = () => {
  return (
    <DashboardLayout>
      <div className="parent-messages">
        <div className="page-header">
          <h1>Pesan</h1>
        </div>

        <div className="page-filters">
          <SearchBar placeholder="Cari pesan..." />
        </div>

        {mockMessages.length === 0 ? (
          <EmptyState
            icon="message"
            title="Tidak Ada Pesan"
            message="Belum ada pesan untuk Anda saat ini."
          />
        ) : (
          <div className="messages-list">
            {mockMessages.map((message) => (
              <Link key={message.id} to={ROUTES.PARENT_MESSAGE_CHAT.replace(':id', message.id)}>
                <Card variant="elevated" className="message-card">
                  <div className="message-header">
                    <div>
                      <h3 className="message-from">
                        {message.from}
                        {message.fromRole && (
                          <span className="message-role"> ({message.fromRole})</span>
                        )}
                      </h3>
                      <p className="message-subject">{message.subject}</p>
                    </div>
                    {!message.isRead && <Badge variant="info" size="small">Baru</Badge>}
                  </div>
                  <p className="message-preview">{message.preview}</p>
                  <div className="message-footer">
                    <span className="message-date">{formatDate(message.date)}</span>
                    <Button variant="outline" size="small">
                      Baca Pesan
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

