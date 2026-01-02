import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormTextarea } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './ForumDetail.css';

const mockPost = {
  id: '1',
  title: 'Diskusi Matematika - Soal Aljabar',
  content: 'Halo semua, ada yang bisa bantu menjelaskan cara menyelesaikan soal aljabar di halaman 25?',
  authorName: 'Ibu Siti',
  authorRole: 'teacher',
  createdAt: new Date('2024-01-15T10:00:00'),
  isPinned: true,
  attachments: [],
};

const mockComments = [
  {
    id: '1',
    content: 'Saya bisa bantu, Bu. Soal tersebut menggunakan konsep distributif.',
    authorName: 'Budi Santoso',
    authorRole: 'student',
    createdAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    content: 'Terima kasih Budi. Bisa dijelaskan lebih detail?',
    authorName: 'Siti Nurhaliza',
    authorRole: 'student',
    createdAt: new Date('2024-01-15T11:00:00'),
  },
];

export const StudentForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Call forumService.addComment
      await new Promise((resolve) => setTimeout(resolve, 500));
      const comment = {
        id: Date.now().toString(),
        content: newComment,
        authorName: user?.fullName || 'Anonymous',
        authorRole: user?.role || 'student',
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

  return (
    <DashboardLayout>
      <div className="forum-detail">
        <div className="detail-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_FORUM)}>
            ← Kembali ke Forum
          </Button>
        </div>

        <Card>
          <div className="post-header">
            <div>
              {mockPost.isPinned && <Badge variant="warning">📌 Pinned</Badge>}
              <h1>{mockPost.title}</h1>
              <div className="post-meta">
                <span className="author">
                  {mockPost.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {mockPost.authorName}
                </span>
                <span className="date">{getRelativeTime(mockPost.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="post-content">
            <p>{mockPost.content}</p>
          </div>
        </Card>

        <Card title={`Komentar (${comments.length})`}>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {comment.authorName}
                  </span>
                  <span className="comment-date">{getRelativeTime(comment.createdAt)}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <FormTextarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
              rows={3}
            />
            <div className="comment-actions">
              <Button type="submit" isLoading={isSubmitting} disabled={!newComment.trim()}>
                Kirim Komentar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

