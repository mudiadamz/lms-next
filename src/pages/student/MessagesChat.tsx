import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormTextarea, Badge, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { messageService, userService } from '../../services';
import './MessagesChat.css';

export const StudentMessagesChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [participant, setParticipant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [messagesData, participantData] = await Promise.all([
          messageService.getMessages(id),
          userService.getUserById(id),
        ]);
        setMessages(messagesData);
        setParticipant(participantData);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    setIsSending(true);
    try {
      const sentMessage = await messageService.sendMessage({
        receiverId: id,
        content: newMessage,
      });
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const isOwnMessage = (message: any) => {
    return message.senderId === user?.id;
  };

  return (
    <DashboardLayout>
      <div className="messages-chat">
        <div className="chat-header">
          <div className="chat-info">
            <h2>{participant?.fullName || 'Loading...'}</h2>
            <Badge variant="primary">{participant?.role === 'teacher' ? 'Guru' : participant?.role || 'User'}</Badge>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <Card className="chat-container">
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${isOwnMessage(message) ? 'message-item--own' : ''}`}
                >
                  <div className="message-content">
                    {!isOwnMessage(message) && (
                      <div className="message-sender">{message.senderName || message.userName || 'Unknown'}</div>
                    )}
                    <div className="message-bubble">{message.content}</div>
                    <div className="message-time">
                      {getRelativeTime(new Date(message.createdAt || message.date || Date.now()))}
                    </div>
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
        )}
      </div>
    </DashboardLayout>
  );
};
