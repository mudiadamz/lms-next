import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, EmptyState, Badge, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { messageService } from '../../services';
import './ParentMessages.css';

export const ParentMessages = () => {
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
      <div className="parent-messages">
        <div className="page-header">
          <h1>Pesan</h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon="message"
            title="Tidak Ada Pesan"
            message="Belum ada pesan untuk Anda saat ini."
          />
        ) : (
          <div className="messages-list">
            {conversations.map((conversation) => (
              <Link key={conversation.userId} to={ROUTES.PARENT_MESSAGE_CHAT.replace(':id', conversation.userId)}>
                <Card variant="elevated" className="message-card">
                  <div className="message-header">
                    <div>
                      <h3 className="message-from">
                        {conversation.userName || 'Unknown'}
                        {conversation.userRole && (
                          <span className="message-role"> ({conversation.userRole === 'teacher' ? 'Guru' : 'Wali Kelas'})</span>
                        )}
                      </h3>
                      <p className="message-subject">Pesan</p>
                    </div>
                    {conversation.unreadCount > 0 && <Badge variant="info" size="small">Baru</Badge>}
                  </div>
                  <p className="message-preview">{conversation.lastMessage || 'No messages yet'}</p>
                  <div className="message-footer">
                    <span className="message-date">
                      {conversation.lastMessageTime ? formatDate(new Date(conversation.lastMessageTime)) : ''}
                    </span>
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

