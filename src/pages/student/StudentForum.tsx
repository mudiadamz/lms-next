import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, getRelativeTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { forumService, userService } from '../../services';
import { ForumPost } from '../../types';
import './StudentForum.css';

interface StudentForumProps {
  readOnly?: boolean;
}

export const StudentForum = ({ readOnly = false }: StudentForumProps = {} as StudentForumProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const forumDetailRoute = readOnly ? ROUTES.PARENT_FORUM_DETAIL : ROUTES.STUDENT_FORUM_DETAIL;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        // Get student's class
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;
        
        if (classId) {
          const data = await forumService.getPosts(classId);
          setPosts(data);
        }
      } catch (error) {
        console.error('Error loading forum posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadPosts();
    }
  }, [user?.id]);
  
  return (
    <DashboardLayout>
      <div className="student-forum">
        <h1>Forum Diskusi</h1>

        {isLoading ? (
          <Loading />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Tidak Ada Diskusi"
            message="Belum ada diskusi yang tersedia."
          />
        ) : (
          <div className="forum-posts">
            {posts.map((post) => (
              <Card key={post.id} variant="elevated">
                <div className="post-card-header">
                  <div>
                    {post.isPinned && <Badge variant="warning">📌 Pinned</Badge>}
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                </div>
                <div className="post-card-meta">
                  <span>
                    {post.authorRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {post.authorName || 'Unknown'}
                  </span>
                  <span>{getRelativeTime(post.createdAt)}</span>
                  <span>💬 {(post as any).commentCount || 0} komentar</span>
                </div>
                <Link to={forumDetailRoute.replace(':id', post.id)}>
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

