import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormTextarea, Badge, Icon, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { messageService, userService, classService } from '../../services';
import './TeacherMessages.css';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'parent';
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export const TeacherMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<{ participantName: string; participantRole: 'student' | 'parent'; participantClass?: string } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      try {
        setIsLoading(true);
        const [messagesData, participantInfo] = await Promise.all([
          messageService.getMessages(id),
          userService.getUserById(id),
        ]);

        // Convert API messages to component format
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName || participantInfo.fullName,
          senderRole: msg.senderRole || (participantInfo.role as 'student' | 'parent'),
          content: msg.content,
          createdAt: new Date(msg.createdAt),
          isRead: msg.isRead || false,
        }));

        setMessages(formattedMessages);

        // Get participant class if student
        let participantClass: string | undefined;
        if (participantInfo.role === 'student') {
          const classId = (participantInfo as any).classId;
          if (classId) {
            const classInfo = await classService.getClassById(classId);
            participantClass = classInfo.name;
          }
        }

        setConversation({
          participantName: participantInfo.fullName,
          participantRole: participantInfo.role as 'student' | 'parent',
          participantClass,
        });
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user?.id) return;

    setIsSending(true);
    try {
      const sentMessage = await messageService.sendMessage({
        receiverId: id,
        content: newMessage,
      });

      const message: Message = {
        id: sentMessage.id,
        senderId: user.id,
        senderName: user.fullName || 'Guru',
        senderRole: 'teacher',
        content: sentMessage.content,
        createdAt: new Date(sentMessage.createdAt),
        isRead: sentMessage.isRead || false,
      };

      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.id || message.senderRole === 'teacher';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="chat"
          title="Percakapan Tidak Ditemukan"
          message="Percakapan yang Anda cari tidak ditemukan."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="messages-chat">
        <div className="chat-header">
          <div className="chat-info">
            <div>
              <h2>{conversation.participantName}</h2>
              {conversation.participantClass && (
                <div className="chat-class">{conversation.participantClass}</div>
              )}
            </div>
            <Badge variant={conversation.participantRole === 'student' ? 'primary' : 'info'}>
              {conversation.participantRole === 'student' ? 'Siswa' : 'Orang Tua'}
            </Badge>
          </div>
        </div>

        <Card className="chat-container">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>Belum ada pesan. Mulai percakapan dengan mengirim pesan pertama!</p>
              </div>
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

          <form onSubmit={handleSend} className="chat-input-form">
            <FormTextarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan..."
              rows={2}
              className="chat-input"
            />
            <Button type="submit" isLoading={isSending} disabled={!newMessage.trim()}>
              <Icon name="chat" size={16} style={{ marginRight: '0.5rem' }} />
              Kirim
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

