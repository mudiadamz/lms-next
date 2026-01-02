import { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import './ParentMessagesChat.css';

const mockMessages = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Ibu Siti',
    senderRole: 'teacher',
    content: 'Halo, saya ingin membahas perkembangan anak Anda dalam mata pelajaran Matematika.',
    createdAt: new Date('2024-01-18T09:00:00'),
    isRead: true,
  },
  {
    id: '2',
    senderId: '4',
    senderName: 'Bapak Santoso',
    senderRole: 'parent',
    content: 'Baik Bu, terima kasih atas perhatiannya. Bagaimana perkembangan anak saya?',
    createdAt: new Date('2024-01-18T09:15:00'),
    isRead: true,
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Ibu Siti',
    senderRole: 'teacher',
    content: 'Anak Anda menunjukkan perkembangan yang baik. Nilai tugas terakhir meningkat dari sebelumnya.',
    createdAt: new Date('2024-01-18T09:20:00'),
    isRead: true,
  },
];

export const ParentMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mockMessages]);

  const isOwnMessage = (message: typeof mockMessages[0]) => {
    return message.senderRole === 'parent';
  };

  return (
    <DashboardLayout>
      <div className="parent-messages-chat">
        <div className="chat-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.PARENT_MESSAGES)}>
            ← Kembali
          </Button>
          <div className="chat-info">
            <h2>Ibu Siti</h2>
            <Badge variant="primary">Guru</Badge>
          </div>
        </div>

        <Card className="chat-container">
          <div className="messages-list">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${isOwnMessage(message) ? 'message-item--own' : ''}`}
              >
                <div className="message-content">
                  {!isOwnMessage(message) && (
                    <div className="message-sender">{message.senderName}</div>
                  )}
                  <div className="message-bubble">{message.content}</div>
                  <div className="message-time">{getRelativeTime(message.createdAt)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-info-note">
            <p>Anda dapat membaca pesan ini. Untuk mengirim pesan, silakan hubungi guru melalui kontak yang tersedia.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

