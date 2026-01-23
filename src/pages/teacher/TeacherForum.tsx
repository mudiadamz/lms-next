import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Modal, FormInput, FormSelect, FormTextarea, Dropdown, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, getRelativeTime } from '../../utils';
import { ForumPost } from '../../types';
import { forumService, classService } from '../../services';
import './TeacherForum.css';

export const TeacherForum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: '',
    isPinned: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData] = await Promise.all([
          classService.getClasses(),
        ]);

        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        
        // Load posts for teacher's classes
        if (classesData.length > 0) {
          const allPosts: ForumPost[] = [];
          for (const cls of classesData) {
            try {
              const classPosts = await forumService.getPosts(cls.id);
              allPosts.push(...classPosts);
            } catch (error) {
              console.error(`Error loading posts for class ${cls.id}:`, error);
            }
          }
          setPosts(allPosts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

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
      setIsSubmitting(true);

      if (!formData.classId) {
        alert('Pilih kelas terlebih dahulu');
        return;
      }

      const newPost = await forumService.createPost({
        classId: formData.classId,
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
      });

      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        classId: '',
        isPinned: false,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Gagal membuat post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (post: ForumPost) => {
    try {
      setIsSubmitting(true);
      const updated = await forumService.updatePost(post.id, {
        isPinned: !post.isPinned,
      });
      setPosts(
        posts.map((p) =>
          p.id === post.id ? updated : p
        )
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengubah status pin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (post: ForumPost) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      setIsSubmitting(true);
      await forumService.deletePost(selectedPost.id);
      setPosts(posts.filter((p) => p.id !== selectedPost.id));
      setShowDeleteDialog(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCommentCount = (postId: string) => {
    // TODO: Get comment count from API
    return (posts.find(p => p.id === postId) as any)?.commentCount || 0;
  };

  const getClassName = (classId: string) => {
    return classes.find((c) => c.value === classId)?.label || classId;
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
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : paginatedPosts.length === 0 ? (
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
              classId: '',
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
              options={[
                { value: '', label: 'Pilih kelas' },
                ...classes,
              ]}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mempublikasikan...' : 'Publikasikan'}
              </Button>
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
