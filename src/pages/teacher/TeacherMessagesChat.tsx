import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormTextarea, Badge, Icon } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
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

// Mock data untuk percakapan
const mockConversations: Record<string, { participantName: string; participantRole: 'student' | 'parent'; participantClass?: string }> = {
  '1': {
    participantName: 'Budi Santoso',
    participantRole: 'student',
    participantClass: 'X IPA 1',
  },
  '2': {
    participantName: 'Bapak Santoso',
    participantRole: 'parent',
    participantClass: 'X IPA 1',
  },
  '3': {
    participantName: 'Siti Nurhaliza',
    participantRole: 'student',
    participantClass: 'X IPA 1',
  },
  '4': {
    participantName: 'Ibu Nurhaliza',
    participantRole: 'parent',
    participantClass: 'X IPA 1',
  },
};

// Mock messages
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      senderId: 'student1',
      senderName: 'Budi Santoso',
      senderRole: 'student',
      content: 'Halo Bu, saya ingin bertanya tentang tugas matematika yang diberikan kemarin.',
      createdAt: new Date('2024-01-18T09:00:00'),
      isRead: true,
    },
    {
      id: '2',
      senderId: 'teacher1',
      senderName: 'Ibu Siti',
      senderRole: 'teacher',
      content: 'Halo Budi, silakan tanyakan apa yang ingin kamu ketahui.',
      createdAt: new Date('2024-01-18T09:05:00'),
      isRead: true,
    },
    {
      id: '3',
      senderId: 'student1',
      senderName: 'Budi Santoso',
      senderRole: 'student',
      content: 'Saya bingung dengan soal nomor 5, bagaimana cara menyelesaikannya?',
      createdAt: new Date('2024-01-18T09:10:00'),
      isRead: true,
    },
    {
      id: '4',
      senderId: 'teacher1',
      senderName: 'Ibu Siti',
      senderRole: 'teacher',
      content: 'Baik, untuk soal nomor 5 kamu perlu menggunakan rumus persamaan kuadrat. Coba lihat contoh di halaman 45 buku paket.',
      createdAt: new Date('2024-01-18T09:15:00'),
      isRead: true,
    },
    {
      id: '5',
      senderId: 'student1',
      senderName: 'Budi Santoso',
      senderRole: 'student',
      content: 'Terima kasih Bu, saya akan coba lagi.',
      createdAt: new Date('2024-01-18T10:30:00'),
      isRead: true,
    },
  ],
  '2': [
    {
      id: '6',
      senderId: 'parent1',
      senderName: 'Bapak Santoso',
      senderRole: 'parent',
      content: 'Selamat pagi Bu, saya ingin menanyakan progress belajar anak saya Budi.',
      createdAt: new Date('2024-01-17T08:00:00'),
      isRead: true,
    },
    {
      id: '7',
      senderId: 'teacher1',
      senderName: 'Ibu Siti',
      senderRole: 'teacher',
      content: 'Selamat pagi Pak, Budi menunjukkan kemajuan yang baik. Nilai-nilainya cukup memuaskan.',
      createdAt: new Date('2024-01-17T08:15:00'),
      isRead: true,
    },
    {
      id: '8',
      senderId: 'parent1',
      senderName: 'Bapak Santoso',
      senderRole: 'parent',
      content: 'Baik Bu, terima kasih atas informasinya.',
      createdAt: new Date('2024-01-17T15:20:00'),
      isRead: false,
    },
  ],
};

export const TeacherMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages[id || ''] || []);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = mockConversations[id || ''] || {
    participantName: 'Unknown',
    participantRole: 'student' as const,
  };

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const message: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'teacher1',
        senderName: user?.fullName || 'Guru',
        senderRole: 'teacher',
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

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.id || message.senderRole === 'teacher';
  };

  return (
    <DashboardLayout>
      <div className="messages-chat">
        <div className="chat-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.TEACHER_MESSAGES)}>
            <Icon name="chevronLeft" size={20} style={{ marginRight: '0.5rem' }} />
            Kembali
          </Button>
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

