import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './ParentForum.css';

const mockPosts = [
  {
    id: '1',
    title: 'Diskusi Matematika - Soal Aljabar',
    authorName: 'Ibu Siti',
    authorRole: 'teacher',
    createdAt: new Date('2024-01-15T10:00:00'),
    commentCount: 5,
    isPinned: true,
  },
  {
    id: '2',
    title: 'Pertanyaan tentang Tugas Bahasa Indonesia',
    authorName: 'Budi Santoso',
    authorRole: 'student',
    createdAt: new Date('2024-01-16T14:30:00'),
    commentCount: 2,
    isPinned: false,
  },
];

export const ParentForum = () => {
  const { user } = useAuth();
  // TODO: Filter forum posts berdasarkan classId dari student (user.studentId -> student.classId)
  // const studentId = user?.studentId;

  return (
    <DashboardLayout>
      <div className="parent-forum">
        <h1>Forum Diskusi</h1>

        {mockPosts.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Tidak Ada Diskusi"
            message="Belum ada diskusi yang tersedia."
          />
        ) : (
          <div className="forum-posts">
            {mockPosts.map((post) => (
              <Card key={post.id} variant="elevated">
                <div className="post-card-header">
                  <div>
                    {post.isPinned && <Badge variant="warning">📌 Pinned</Badge>}
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                </div>
                <div className="post-card-meta">
                  <span>
                    {post.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {post.authorName}
                  </span>
                  <span>{getRelativeTime(post.createdAt)}</span>
                  <span>💬 {post.commentCount} komentar</span>
                </div>
                <Link to={ROUTES.PARENT_FORUM_DETAIL.replace(':id', post.id)}>
                  <Button variant="outline" className="post-action-button">
                    Lihat Diskusi
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

