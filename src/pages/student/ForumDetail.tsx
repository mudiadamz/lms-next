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
  const [error, setError] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const postData = await forumService.getPostById(id);
        setPost(postData);
        // Comments are included in the post data
        setComments(postData.comments || []);
      } catch (err) {
        console.error('Error loading forum post:', err);
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(errorMessage);
        setPost(null);
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

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !id || !replyToCommentId) return;

    setIsSubmitting(true);
    try {
      const comment = await forumService.addComment(id, {
        content: replyContent,
        parentCommentId: replyToCommentId,
      });
      setComments([...comments, comment]);
      setReplyContent('');
      setReplyToCommentId(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengirim balasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group comments by parent
  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (commentId: string) => {
    return comments.filter(c => c.parentCommentId === commentId);
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
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {error?.includes('Insufficient permissions') 
                  ? 'Anda tidak memiliki akses ke post ini' 
                  : 'Post tidak ditemukan'}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--ios-gray)', marginBottom: '1.5rem' }}>
                {error?.includes('Insufficient permissions')
                  ? 'Post ini mungkin untuk kelas lain atau sudah dihapus.'
                  : 'Post yang Anda cari tidak ada atau sudah dihapus.'}
              </p>
              <Button variant="outline" onClick={() => navigate(readOnly ? ROUTES.PARENT_FORUM : ROUTES.STUDENT_FORUM)}>
                ← Kembali ke Forum
              </Button>
            </div>
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
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <div className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {comment.authorName}
                    </span>
                    <span className="comment-date">
                      {getRelativeTime(new Date(comment.createdAt || comment.date || Date.now()))}
                    </span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  {!readOnly && (
                    <button
                      onClick={() => {
                        setReplyToCommentId(comment.id);
                        setReplyContent('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ios-blue)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0',
                        marginTop: '0.5rem'
                      }}
                    >
                      💬 Balas
                    </button>
                  )}
                </div>

                {/* Replies */}
                {getReplies(comment.id).length > 0 && (
                  <div className="comment-replies" style={{ marginLeft: '2rem', marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid var(--ios-separator)' }}>
                    {getReplies(comment.id).map((reply) => (
                      <div key={reply.id} className="comment-item" style={{ marginBottom: '0.75rem' }}>
                        <div className="comment-header">
                          <span className="comment-author">
                            {reply.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {reply.authorName}
                          </span>
                          <span className="comment-date">
                            {getRelativeTime(new Date(reply.createdAt || reply.date || Date.now()))}
                          </span>
                        </div>
                        <div className="comment-content">{reply.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyToCommentId === comment.id && !readOnly && (
                  <div style={{ marginLeft: '2rem', marginTop: '0.75rem' }}>
                    <form onSubmit={handleSubmitReply} className="reply-form">
                      <FormTextarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Balas ke ${comment.authorName}...`}
                        rows={2}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Button type="submit" size="small" isLoading={isSubmitting} disabled={!replyContent.trim()}>
                          Kirim Balasan
                        </Button>
                        <Button type="button" variant="outline" size="small" onClick={() => setReplyToCommentId(null)}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
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

