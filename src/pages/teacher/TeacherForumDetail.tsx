import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormTextarea, Dropdown, Icon, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { ForumPost } from '../../types';
import { forumService } from '../../services';
import './TeacherForum.css';

export const TeacherForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any | null>(null);

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

  const handleDeleteComment = (comment: any) => {
    setSelectedComment(comment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteComment = async () => {
    if (!selectedComment || !id) return;
    try {
      await forumService.deleteComment(id, selectedComment.id);
      setComments(comments.filter((c) => c.id !== selectedComment.id));
      setShowDeleteDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus komentar');
    }
  };

  const handleTogglePin = async () => {
    if (!post || !id) return;
    try {
      const updated = await forumService.updatePost(id, {
        isPinned: !post.isPinned,
      });
      setPost(updated);
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengubah status pin');
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
                  {post.authorName || 'Unknown'}
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
                      <span>{getRelativeTime(new Date(comment.createdAt || comment.date || Date.now()))}</span>
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

