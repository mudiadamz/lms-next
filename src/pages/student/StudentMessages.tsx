import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import './StudentMessages.css';

const mockConversations = [
  {
    id: '1',
    participantName: 'Ibu Siti',
    participantRole: 'teacher',
    lastMessage: 'Baik, silakan tanyakan. Saya siap membantu.',
    lastMessageTime: new Date('2024-01-18T09:20:00'),
    unreadCount: 0,
  },
  {
    id: '2',
    participantName: 'Bapak Budi',
    participantRole: 'teacher',
    lastMessage: 'Tugas sudah dikumpulkan dengan baik.',
    lastMessageTime: new Date('2024-01-17T15:30:00'),
    unreadCount: 2,
  },
];

export const StudentMessages = () => {
  return (
    <DashboardLayout>
      <div className="student-messages">
        <div className="messages-header">
          <h1>Pesan</h1>
          <Button>Pesan Baru</Button>
        </div>

        {mockConversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Tidak Ada Pesan"
            message="Belum ada pesan yang tersedia."
            action={{ label: 'Kirim Pesan Baru', onClick: () => console.log('New message') }}
          />
        ) : (
          <div className="conversations-list">
            {mockConversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={ROUTES.STUDENT_MESSAGE_CHAT.replace(':id', conversation.id)}
                className="conversation-link"
              >
                <Card variant="elevated" className="conversation-card">
                  <div className="conversation-header">
                    <div className="conversation-info">
                      <h3>
                        {conversation.participantRole === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}{' '}
                        {conversation.participantName}
                      </h3>
                      <Badge variant={conversation.participantRole === 'teacher' ? 'primary' : 'secondary'}>
                        {conversation.participantRole === 'teacher' ? 'Guru' : 'Orang Tua'}
                      </Badge>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="danger">{conversation.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="conversation-preview">{conversation.lastMessage}</p>
                  <span className="conversation-time">{getRelativeTime(conversation.lastMessageTime)}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

