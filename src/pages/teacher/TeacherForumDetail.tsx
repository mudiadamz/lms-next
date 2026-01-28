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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const postData = await forumService.getPostById(id);
        setPost(postData);
        setComments(postData.comments || []);
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
      const comment = await forumService.addComment(id, newComment);
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
    if (!selectedComment) return;
    try {
      await forumService.deleteComment(selectedComment.id);
      setComments(comments.filter((c) => c.id !== selectedComment.id));
      setShowDeleteDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus komentar');
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      const updatedComment = await forumService.updateComment(commentId, editContent);
      setComments(comments.map((c) => (c.id === commentId ? updatedComment : c)));
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengupdate komentar');
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
  const topLevelComments = comments.filter(c => !(c as any).parentCommentId);
  const getReplies = (commentId: string) => {
    return comments.filter(c => (c as any).parentCommentId === commentId);
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
              {topLevelComments.map((comment) => (
                <div key={comment.id}>
                  <div className="comment-item">
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
                      {(comment.authorId === user?.id || user?.role === 'teacher') && !editingCommentId && (
                        <Dropdown
                          trigger={<Button variant="outline" size="small">⋯</Button>}
                          items={[
                            { label: 'Edit', onClick: () => handleEditComment(comment) },
                            { divider: true },
                            { label: 'Hapus', onClick: () => handleDeleteComment(comment) },
                          ]}
                          align="right"
                        />
                      )}
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div style={{ marginTop: '1rem' }}>
                      <FormTextarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                        <Button variant="outline" size="small" onClick={handleCancelEdit}>
                          Batal
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editContent.trim() || isSubmitting}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-content">
                        <p>{comment.content}</p>
                      </div>
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
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Icon name="chat" size={14} />
                        Balas
                      </button>
                    </>
                  )}
                  </div>

                  {/* Replies */}
                  {getReplies(comment.id).length > 0 && (
                    <div className="comment-replies" style={{ marginLeft: '2rem', marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid var(--ios-separator)' }}>
                      {getReplies(comment.id).map((reply) => (
                        <div key={reply.id} className="comment-item" style={{ marginBottom: '0.75rem' }}>
                          <div className="comment-header">
                            <div className="comment-author">
                              <Icon
                                name={reply.authorRole === 'teacher' ? 'user' : 'users'}
                                size={18}
                                style={{ marginRight: '0.5rem' }}
                              />
                              <strong>{reply.authorName}</strong>
                              {reply.authorRole === 'teacher' && (
                                <Badge variant="primary" size="small" style={{ marginLeft: '0.5rem' }}>
                                  Guru
                                </Badge>
                              )}
                            </div>
                            <div className="comment-meta">
                              <span>{getRelativeTime(new Date(reply.createdAt || reply.date || Date.now()))}</span>
                            </div>
                          </div>
                          <div className="comment-content">
                            <p>{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyToCommentId === comment.id && (
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

