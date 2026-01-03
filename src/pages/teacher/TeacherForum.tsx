import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Modal, FormInput, FormSelect, FormTextarea, Dropdown, Icon, EmptyState, Pagination } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, getRelativeTime } from '../../utils';
import { ForumPost } from '../../types';
import './TeacherForum.css';

// Interface untuk komentar
interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  content: string;
  createdAt: Date;
}

// Contoh data forum posts
const mockPosts: ForumPost[] = [
  {
    id: '1',
    classId: 'class1',
    authorId: 'teacher1',
    authorName: 'Ibu Siti',
    authorRole: 'teacher',
    title: 'Diskusi Matematika - Soal Aljabar',
    content: 'Halo semua, ada yang bisa bantu menjelaskan cara menyelesaikan soal aljabar di halaman 25? Silakan diskusikan di sini.',
    isPinned: true,
    createdAt: new Date('2024-01-15T10:00:00'),
    updatedAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    classId: 'class1',
    authorId: 'student1',
    authorName: 'Budi Santoso',
    authorRole: 'student',
    title: 'Pertanyaan tentang Tugas Bahasa Indonesia',
    content: 'Saya ingin bertanya tentang tugas menulis esai yang diberikan minggu lalu. Apakah ada batasan jumlah kata?',
    isPinned: false,
    createdAt: new Date('2024-01-16T14:30:00'),
    updatedAt: new Date('2024-01-16T14:30:00'),
  },
  {
    id: '3',
    classId: 'class2',
    authorId: 'teacher1',
    authorName: 'Ibu Siti',
    authorRole: 'teacher',
    title: 'Pengumuman Ujian Tengah Semester',
    content: 'Ujian Tengah Semester akan dilaksanakan pada tanggal 20-25 Februari 2024. Silakan persiapkan diri dengan baik.',
    isPinned: true,
    createdAt: new Date('2024-01-17T09:00:00'),
    updatedAt: new Date('2024-01-17T09:00:00'),
  },
];

// Mock data untuk komentar
const mockComments: Record<string, ForumComment[]> = {
  '1': [
    {
      id: '1',
      postId: '1',
      authorId: 'student1',
      authorName: 'Budi Santoso',
      authorRole: 'student',
      content: 'Saya bisa bantu, Bu. Soal tersebut menggunakan konsep distributif.',
      createdAt: new Date('2024-01-15T10:30:00'),
    },
    {
      id: '2',
      postId: '1',
      authorId: 'student2',
      authorName: 'Siti Nurhaliza',
      authorRole: 'student',
      content: 'Terima kasih Budi. Bisa dijelaskan lebih detail?',
      createdAt: new Date('2024-01-15T11:00:00'),
    },
  ],
  '2': [
    {
      id: '3',
      postId: '2',
      authorId: 'teacher1',
      authorName: 'Ibu Siti',
      authorRole: 'teacher',
      content: 'Tidak ada batasan jumlah kata yang ketat, namun minimal 500 kata dan maksimal 1000 kata.',
      createdAt: new Date('2024-01-16T15:00:00'),
    },
  ],
};

// Mock data untuk kelas
const MOCK_CLASSES = [
  { value: 'class1', label: 'X IPA 1' },
  { value: 'class2', label: 'X IPA 2' },
  { value: 'class3', label: 'XI IPA 1' },
  { value: 'all', label: 'Semua Kelas' },
];

export const TeacherForum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: 'all',
    isPinned: false,
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || post.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Sort: pinned first, then by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreatePost = () => {
    setFormData({
      title: '',
      content: '',
      classId: 'all',
      isPinned: false,
    });
    setShowCreateModal(true);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPost: ForumPost = {
        id: Date.now().toString(),
        classId: formData.classId === 'all' ? 'class1' : formData.classId,
        authorId: user?.id || 'teacher1',
        authorName: user?.fullName || 'Guru',
        authorRole: 'teacher',
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        classId: 'all',
        isPinned: false,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Gagal membuat post');
    }
  };

  const handleTogglePin = async (post: ForumPost) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, isPinned: !p.isPinned } : p
        )
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Gagal mengubah status pin');
    }
  };

  const handleDelete = (post: ForumPost) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPosts(posts.filter((p) => p.id !== selectedPost.id));
      setShowDeleteDialog(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Gagal menghapus post');
    }
  };

  const getCommentCount = (postId: string) => {
    return mockComments[postId]?.length || 0;
  };

  const getClassName = (classId: string) => {
    return MOCK_CLASSES.find((c) => c.value === classId)?.label || classId;
  };

  return (
    <DashboardLayout>
      <div className="teacher-forum">
        <div className="page-header">
          <h1>Forum Diskusi</h1>
          <Button onClick={handleCreatePost}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Buat Post Baru
          </Button>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              {MOCK_CLASSES.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {paginatedPosts.length === 0 ? (
            <EmptyState
            icon="chat"
            title="Tidak Ada Diskusi"
            message={selectedClass !== 'all'
              ? 'Tidak ada diskusi yang sesuai dengan filter yang dipilih.'
              : 'Belum ada diskusi yang dibuat.'}
            action={{
              label: 'Buat Post Baru',
              onClick: handleCreatePost,
            }}
          />
        ) : (
          <div className="forum-posts">
            {paginatedPosts.map((post) => (
              <Card key={post.id} variant="elevated" className="forum-post-card">
                <div className="post-card-header">
                  <div className="post-header-content">
                    {post.isPinned && (
                      <Badge variant="warning" style={{ marginBottom: '0.5rem' }}>
                        <Icon name="star" size={14} style={{ marginRight: '0.25rem' }} />
                        Pinned
                      </Badge>
                    )}
                    <h3 className="post-title">{post.title}</h3>
                    <div className="post-meta">
                      <span className="post-author">
                        <Icon
                          name={post.authorRole === 'teacher' ? 'user' : 'users'}
                          size={16}
                          style={{ marginRight: '0.25rem' }}
                        />
                        {post.authorName}
                      </span>
                      <span className="post-class">{getClassName(post.classId)}</span>
                      <span className="post-date">{getRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                  <Dropdown
                    trigger={<Button variant="outline" size="small">⋯</Button>}
                    items={[
                      { label: post.isPinned ? 'Lepas Pin' : 'Pin', onClick: () => handleTogglePin(post) },
                      { label: 'Edit', onClick: () => console.log('Edit', post.id) },
                      { divider: true },
                      { label: 'Hapus', onClick: () => handleDelete(post) },
                    ]}
                    align="right"
                  />
                </div>
                <div className="post-content-preview">
                  <p>{post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}</p>
                </div>
                <div className="post-footer">
                  <div className="post-stats">
                    <Icon name="chat" size={16} />
                    <span>{getCommentCount(post.id)} komentar</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`${ROUTES.TEACHER_FORUM_DETAIL?.replace(':id', post.id) || `/teacher/forum/${post.id}`}`)}
                  >
                    Lihat Diskusi
                  </Button>
                </div>
              </Card>
            ))}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}

        {/* Create Post Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              title: '',
              content: '',
              classId: 'all',
              isPinned: false,
            });
          }}
          title="Buat Post Baru"
          size="large"
        >
          <form onSubmit={handleSubmitPost} className="forum-post-form">
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                />
                <span>Pin post (tampilkan di atas)</span>
              </label>
            </div>
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={MOCK_CLASSES}
              required
            />
            <FormInput
              label="Judul Post"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul diskusi"
              required
            />
            <FormTextarea
              label="Isi Post"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Masukkan isi diskusi"
              rows={6}
              required
            />
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    content: '',
                    classId: 'all',
                    isPinned: false,
                  });
                }}
              >
                Batal
              </Button>
              <Button type="submit">Publikasikan</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && selectedPost && (
          <div className="delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
            <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Hapus Post</h3>
              <p>Apakah Anda yakin ingin menghapus post "{selectedPost.title}"? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="dialog-actions">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
