import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar, EmptyState, Icon, Modal, FormSelect, FormInput, FormTextarea } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import './TeacherMessages.css';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'student' | 'parent';
  participantClass?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Mock data percakapan
const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: 'student1',
    participantName: 'Budi Santoso',
    participantRole: 'student',
    participantClass: 'X IPA 1',
    lastMessage: 'Terima kasih Bu, saya akan coba lagi.',
    lastMessageTime: new Date('2024-01-18T10:30:00'),
    unreadCount: 0,
  },
  {
    id: '2',
    participantId: 'parent1',
    participantName: 'Bapak Santoso',
    participantRole: 'parent',
    participantClass: 'X IPA 1',
    lastMessage: 'Baik Bu, terima kasih atas informasinya.',
    lastMessageTime: new Date('2024-01-17T15:20:00'),
    unreadCount: 2,
  },
  {
    id: '3',
    participantId: 'student2',
    participantName: 'Siti Nurhaliza',
    participantRole: 'student',
    participantClass: 'X IPA 1',
    lastMessage: 'Saya sudah mengerjakan tugas yang diberikan.',
    lastMessageTime: new Date('2024-01-18T09:15:00'),
    unreadCount: 1,
  },
  {
    id: '4',
    participantId: 'parent2',
    participantName: 'Ibu Nurhaliza',
    participantRole: 'parent',
    participantClass: 'X IPA 1',
    lastMessage: 'Bagaimana progress belajar anak saya?',
    lastMessageTime: new Date('2024-01-16T14:00:00'),
    unreadCount: 0,
  },
];

const MOCK_STUDENTS = [
  { value: 'student1', label: 'Budi Santoso - X IPA 1' },
  { value: 'student2', label: 'Siti Nurhaliza - X IPA 1' },
  { value: 'student3', label: 'Andi Pratama - X IPA 1' },
];

const MOCK_PARENTS = [
  { value: 'parent1', label: 'Bapak Santoso (Orang Tua Budi)' },
  { value: 'parent2', label: 'Ibu Nurhaliza (Orang Tua Siti)' },
];

export const TeacherMessages = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'parent'>('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    recipientType: 'student',
    recipientId: '',
    subject: '',
    content: '',
  });

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || conv.participantRole === filterRole;
    return matchesSearch && matchesRole;
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Navigate to chat
      const conversationId = newMessageData.recipientId;
      navigate(`${ROUTES.TEACHER_MESSAGES_CHAT?.replace(':id', conversationId) || `/teacher/messages/${conversationId}`}`);
      setShowNewMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan');
    }
  };

  const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
          <SearchBar
            placeholder="Cari pesan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {filteredConversations.length === 0 ? (
          <EmptyState
            icon="message"
            title="Tidak Ada Pesan"
            message={searchTerm || filterRole !== 'all'
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
                key={conversation.id}
                variant="elevated"
                className={`conversation-card ${conversation.unreadCount > 0 ? 'conversation-card--unread' : ''}`}
                onClick={() => {
                  const chatRoute = ROUTES.TEACHER_MESSAGES_CHAT?.replace(':id', conversation.id) || `/teacher/messages/${conversation.id}`;
                  navigate(chatRoute);
                }}
              >
                <div className="conversation-header">
                  <div className="conversation-info">
                    <div className="conversation-name-row">
                      <Icon
                        name={conversation.participantRole === 'student' ? 'users' : 'user'}
                        size={20}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <h3>{conversation.participantName}</h3>
                      <Badge
                        variant={conversation.participantRole === 'student' ? 'primary' : 'info'}
                        size="small"
                      >
                        {conversation.participantRole === 'student' ? 'Siswa' : 'Orang Tua'}
                      </Badge>
                    </div>
                    {conversation.participantClass && (
                      <div className="conversation-class">{conversation.participantClass}</div>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="danger">{conversation.unreadCount}</Badge>
                  )}
                </div>
                <p className="conversation-preview">{conversation.lastMessage}</p>
                <span className="conversation-time">{getRelativeTime(conversation.lastMessageTime)}</span>
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
                ...(newMessageData.recipientType === 'student' ? MOCK_STUDENTS : MOCK_PARENTS),
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
              <Button type="submit">Kirim Pesan</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
