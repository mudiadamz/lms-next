import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import { messageService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './ParentMessagesChat.css';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'parent';
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export const ParentMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      try {
        setIsLoading(true);
        const [messagesData, teacherInfo] = await Promise.all([
          messageService.getMessages(id),
          userService.getUserById(id),
        ]);

        setTeacherName(teacherInfo.fullName);

        // Convert API messages to component format
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName || teacherInfo.fullName,
          senderRole: msg.senderRole || 'teacher',
          content: msg.content,
          createdAt: new Date(msg.createdAt),
          isRead: msg.isRead || false,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isOwnMessage = (message: Message) => {
    return message.senderRole === 'parent' || message.senderId === user?.id;
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
      <div className="parent-messages-chat">
        <div className="chat-header">
          <div className="chat-info">
            <h2>{teacherName || 'Guru'}</h2>
            <Badge variant="primary">Guru</Badge>
          </div>
        </div>

        <Card className="chat-container">
          <div className="messages-list">
            {messages.length === 0 ? (
              <EmptyState
                icon="chat"
                title="Belum Ada Pesan"
                message="Belum ada pesan dalam percakapan ini."
              />
            ) : (
              messages.map((message) => (
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
              ))
            )}
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

