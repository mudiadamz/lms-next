import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { messageService } from '../../services';
import './StudentMessages.css';

export const StudentMessages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messageService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  return (
    <DashboardLayout>
      <div className="student-messages">
        <div className="messages-header">
          <h1>Pesan</h1>
          <Button>Pesan Baru</Button>
        </div>

        {isLoading ? (
          <Loading />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Tidak Ada Pesan"
            message="Belum ada pesan yang tersedia."
            action={{ label: 'Kirim Pesan Baru', onClick: () => console.log('New message') }}
          />
        ) : (
          <div className="conversations-list">
            {conversations.map((conversation) => (
              <Link
                key={conversation.userId}
                to={ROUTES.STUDENT_MESSAGE_CHAT.replace(':id', conversation.userId)}
                className="conversation-link"
              >
                <Card variant="elevated" className="conversation-card">
                  <div className="conversation-header">
                    <div className="conversation-info">
                      <h3>
                        {conversation.userRole === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}{' '}
                        {conversation.userName || 'Unknown'}
                      </h3>
                      <Badge variant={conversation.userRole === 'teacher' ? 'primary' : 'secondary'}>
                        {conversation.userRole === 'teacher' ? 'Guru' : 'Orang Tua'}
                      </Badge>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="danger">{conversation.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="conversation-preview">{conversation.lastMessage || 'No messages yet'}</p>
                  <span className="conversation-time">
                    {conversation.lastMessageTime ? getRelativeTime(new Date(conversation.lastMessageTime)) : ''}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

