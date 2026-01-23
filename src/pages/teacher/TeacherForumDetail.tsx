import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormTextarea, Dropdown, Icon, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
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

// Mock data untuk post
const mockPost: ForumPost = {
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
};

// Mock data untuk komentar
const mockComments: ForumComment[] = [
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
  {
    id: '3',
    postId: '1',
    authorId: 'teacher1',
    authorName: 'Ibu Siti',
    authorRole: 'teacher',
    content: 'Baik, saya akan jelaskan lebih detail. Konsep distributif adalah...',
    createdAt: new Date('2024-01-15T11:15:00'),
  },
];

export const TeacherForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost>(mockPost);
  const [comments, setComments] = useState<ForumComment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<ForumComment | null>(null);

  useEffect(() => {
    // TODO: Fetch post and comments from API based on id
    // For now, using mock data
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const comment: ForumComment = {
        id: Date.now().toString(),
        postId: id || '',
        authorId: user?.id || 'teacher1',
        authorName: user?.fullName || 'Guru',
        authorRole: 'teacher',
        content: newComment,
        createdAt: new Date(),
      };

      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Gagal mengirim komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (comment: ForumComment) => {
    setSelectedComment(comment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteComment = async () => {
    if (!selectedComment) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setComments(comments.filter((c) => c.id !== selectedComment.id));
      setShowDeleteDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Gagal menghapus komentar');
    }
  };

  const handleTogglePin = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPost({ ...post, isPinned: !post.isPinned });
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Gagal mengubah status pin');
    }
  };

  return (
    <DashboardLayout>
      <div className="forum-detail">
        <div className="detail-header">
          <Dropdown
            trigger={<Button variant="outline">Kelola</Button>}
            items={[
              { label: post.isPinned ? 'Lepas Pin' : 'Pin', onClick: handleTogglePin },
              { label: 'Edit Post', onClick: () => console.log('Edit post', post.id) },
              { divider: true },
              { label: 'Hapus Post', onClick: () => console.log('Delete post', post.id) },
            ]}
            align="right"
          />
        </div>

        <Card variant="elevated">
          <div className="post-header">
            <div>
              {post.isPinned && (
                <Badge variant="warning" style={{ marginBottom: '0.5rem' }}>
                  <Icon name="star" size={14} style={{ marginRight: '0.25rem' }} />
                  Pinned
                </Badge>
              )}
              <h1>{post.title}</h1>
              <div className="post-meta">
                <span className="author">
                  <Icon
                    name={post.authorRole === 'teacher' ? 'user' : 'users'}
                    size={16}
                    style={{ marginRight: '0.25rem' }}
                  />
                  {post.authorName}
                </span>
                <span className="date">{getRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="post-content">
            <p>{post.content}</p>
          </div>
        </Card>

        <Card title={`Komentar (${comments.length})`} variant="elevated" style={{ marginTop: '1.5rem' }}>
          {comments.length === 0 ? (
            <EmptyState
              icon="chat"
              title="Belum Ada Komentar"
              message="Jadilah yang pertama berkomentar!"
            />
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <Icon
                        name={comment.authorRole === 'teacher' ? 'user' : 'users'}
                        size={18}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <strong>{comment.authorName}</strong>
                      {comment.authorRole === 'teacher' && (
                        <Badge variant="primary" size="small" style={{ marginLeft: '0.5rem' }}>
                          Guru
                        </Badge>
                      )}
                    </div>
                    <div className="comment-meta">
                      <span>{getRelativeTime(comment.createdAt)}</span>
                      {(comment.authorId === user?.id || user?.role === 'teacher') && (
                        <Dropdown
                          trigger={<Button variant="outline" size="small">⋯</Button>}
                          items={[
                            { label: 'Edit', onClick: () => console.log('Edit comment', comment.id) },
                            { divider: true },
                            { label: 'Hapus', onClick: () => handleDeleteComment(comment) },
                          ]}
                          align="right"
                        />
                      )}
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="comment-form-section">
            <form onSubmit={handleSubmitComment} className="comment-form">
              <FormTextarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                rows={3}
                required
              />
              <div className="comment-form-actions">
                <Button type="submit" isLoading={isSubmitting} disabled={!newComment.trim()}>
                  <Icon name="chat" size={16} style={{ marginRight: '0.5rem' }} />
                  Kirim Komentar
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Delete Comment Dialog */}
        {showDeleteDialog && selectedComment && (
          <div className="delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
            <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Hapus Komentar</h3>
              <p>Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="dialog-actions">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={confirmDeleteComment}>
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

