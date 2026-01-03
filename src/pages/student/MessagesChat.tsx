import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormTextarea, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './MessagesChat.css';

const mockMessages = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Ibu Siti',
    senderRole: 'teacher',
    content: 'Halo Budi, bagaimana progress tugas matematika?',
    createdAt: new Date('2024-01-18T09:00:00'),
    isRead: true,
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Budi Santoso',
    senderRole: 'student',
    content: 'Halo Bu, saya sudah mengerjakan setengahnya. Ada yang ingin saya tanyakan.',
    createdAt: new Date('2024-01-18T09:15:00'),
    isRead: true,
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Ibu Siti',
    senderRole: 'teacher',
    content: 'Baik, silakan tanyakan. Saya siap membantu.',
    createdAt: new Date('2024-01-18T09:20:00'),
    isRead: true,
  },
];

export const StudentMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      // TODO: Call messageService.sendMessage
      await new Promise((resolve) => setTimeout(resolve, 500));
      const message = {
        id: Date.now().toString(),
        senderId: user?.id || '1',
        senderName: user?.fullName || 'You',
        senderRole: user?.role || 'student',
        content: newMessage,
        createdAt: new Date(),
        isRead: false,
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

  const isOwnMessage = (message: typeof mockMessages[0]) => {
    return message.senderId === user?.id;
  };

  return (
    <DashboardLayout>
      <div className="messages-chat">
        <div className="chat-header">
          <div className="chat-info">
            <h2>Ibu Siti</h2>
            <Badge variant="primary">Guru</Badge>
          </div>
        </div>

        <Card className="chat-container">
          <div className="messages-list">
            {messages.map((message) => (
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

          <form onSubmit={handleSend} className="chat-input-form">
            <FormTextarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan..."
              rows={2}
              className="chat-input"
            />
            <Button type="submit" isLoading={isSending} disabled={!newMessage.trim()}>
              Kirim
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
