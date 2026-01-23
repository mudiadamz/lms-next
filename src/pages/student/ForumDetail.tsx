import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormTextarea, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services';
import { ForumPost } from '../../types';
import './ForumDetail.css';

interface StudentForumDetailProps {
  readOnly?: boolean;
}

export const StudentForumDetail = ({ readOnly = false }: StudentForumDetailProps = {} as StudentForumDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [postData, commentsData] = await Promise.all([
          forumService.getPost(id),
          forumService.getComments(id),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading forum post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      const comment = await forumService.addComment(id, {
        content: newComment,
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengirim komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="forum-detail">
          <Card>
            <p>Post tidak ditemukan</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="forum-detail">

        <Card>
          <div className="post-header">
            <div>
              {post.isPinned && <Badge variant="warning">📌 Pinned</Badge>}
              <h1>{post.title}</h1>
              <div className="post-meta">
                <span className="author">
                  {post.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {post.authorName || 'Unknown'}
                </span>
                <span className="date">{getRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="post-content">
            <p>{post.content}</p>
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
                  <span className="comment-date">
                    {getRelativeTime(new Date(comment.createdAt || comment.date || Date.now()))}
                  </span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          {readOnly ? (
            <div className="info-note" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p>Sebagai orang tua, Anda dapat melihat diskusi ini tetapi tidak dapat berpartisipasi.</p>
            </div>
          ) : (
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
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

