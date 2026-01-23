import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Icon, Modal, FormSelect, FormInput, FormTextarea, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import { messageService, userService } from '../../services';
import './TeacherMessages.css';

export const TeacherMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [students, setStudents] = useState<Array<{ value: string; label: string }>>([]);
  const [parents, setParents] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'parent'>('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    recipientType: 'student',
    recipientId: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [conversationsData, studentsData, parentsData] = await Promise.all([
          messageService.getConversations(),
          userService.getUsers('student'),
          userService.getUsers('parent'),
        ]);

        setConversations(conversationsData);
        setStudents(studentsData.map(s => ({ value: s.id, label: `${s.fullName} - ${(s as any).classId || ''}` })));
        setParents(parentsData.map(p => ({ value: p.id, label: p.fullName })));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const matchesRole = filterRole === 'all' || conv.userRole === filterRole;
    return matchesRole;
  });

  const handleNewMessage = () => {
    setNewMessageData({
      recipientType: 'student',
      recipientId: '',
      subject: '',
      content: '',
    });
    setShowNewMessageModal(true);
  };

  const handleSendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageData.recipientId || !newMessageData.content.trim()) {
      alert('Pilih penerima dan isi pesan terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      await messageService.sendMessage(newMessageData.recipientId, {
        content: newMessageData.content,
        subject: newMessageData.subject || undefined,
      });
      
      // Navigate to chat
      const conversationId = newMessageData.recipientId;
      navigate(`${ROUTES.TEACHER_MESSAGES_CHAT?.replace(':id', conversationId) || `/teacher/messages/${conversationId}`}`);
      setShowNewMessageModal(false);
      
      // Reload conversations
      const updated = await messageService.getConversations();
      setConversations(updated);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengirim pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="teacher-messages">
        <div className="messages-header">
          <div>
            <h1>Pesan</h1>
            {totalUnread > 0 && (
              <Badge variant="danger" style={{ marginLeft: '0.5rem' }}>
                {totalUnread} belum dibaca
              </Badge>
            )}
          </div>
          <Button onClick={handleNewMessage}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Pesan Baru
          </Button>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'student' | 'parent')}
              className="filter-select"
            >
              <option value="all">Semua</option>
              <option value="student">Siswa</option>
              <option value="parent">Orang Tua</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon="message"
            title="Tidak Ada Pesan"
            message={filterRole !== 'all'
              ? 'Tidak ada pesan yang sesuai dengan filter yang dipilih.'
              : 'Belum ada pesan yang tersedia.'}
            action={{
              label: 'Kirim Pesan Baru',
              onClick: handleNewMessage,
            }}
          />
        ) : (
          <div className="conversations-list">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.userId}
                variant="elevated"
                className={`conversation-card ${conversation.unreadCount > 0 ? 'conversation-card--unread' : ''}`}
                onClick={() => {
                  const chatRoute = ROUTES.TEACHER_MESSAGES_CHAT?.replace(':id', conversation.userId) || `/teacher/messages/${conversation.userId}`;
                  navigate(chatRoute);
                }}
              >
                <div className="conversation-header">
                  <div className="conversation-info">
                    <div className="conversation-name-row">
                      <Icon
                        name={conversation.userRole === 'student' ? 'users' : 'user'}
                        size={20}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <h3>{conversation.userName || 'Unknown'}</h3>
                      <Badge
                        variant={conversation.userRole === 'student' ? 'primary' : 'info'}
                        size="small"
                      >
                        {conversation.userRole === 'student' ? 'Siswa' : 'Orang Tua'}
                      </Badge>
                    </div>
                    {conversation.userClass && (
                      <div className="conversation-class">{conversation.userClass}</div>
                    )}
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
            ))}
          </div>
        )}

        {/* New Message Modal */}
        <Modal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          title="Pesan Baru"
          size="medium"
        >
          <form onSubmit={handleSendNewMessage} className="new-message-form">
            <FormSelect
              label="Tipe Penerima"
              value={newMessageData.recipientType}
              onChange={(e) =>
                setNewMessageData({
                  ...newMessageData,
                  recipientType: e.target.value,
                  recipientId: '',
                })
              }
              options={[
                { value: 'student', label: 'Siswa' },
                { value: 'parent', label: 'Orang Tua' },
              ]}
              required
            />
            <FormSelect
              label={newMessageData.recipientType === 'student' ? 'Pilih Siswa' : 'Pilih Orang Tua'}
              value={newMessageData.recipientId}
              onChange={(e) => setNewMessageData({ ...newMessageData, recipientId: e.target.value })}
              options={[
                { 
                  value: '', 
                  label: newMessageData.recipientType === 'student' ? 'Pilih siswa' : 'Pilih orang tua'
                },
                ...(newMessageData.recipientType === 'student' ? students : parents),
              ]}
              required
            />
            <FormInput
              label="Subjek (Opsional)"
              value={newMessageData.subject}
              onChange={(e) => setNewMessageData({ ...newMessageData, subject: e.target.value })}
              placeholder="Masukkan subjek pesan"
            />
            <FormTextarea
              label="Isi Pesan"
              value={newMessageData.content}
              onChange={(e) => setNewMessageData({ ...newMessageData, content: e.target.value })}
              placeholder="Tulis pesan Anda..."
              rows={5}
              required
            />
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowNewMessageModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
