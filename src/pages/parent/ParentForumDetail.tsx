import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, getRelativeTime } from '../../utils';
import './ParentForumDetail.css';

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

export const ParentForumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="parent-forum-detail">
        <div className="detail-header">
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

        <Card title={`Komentar (${mockComments.length})`}>
          <div className="comments-list">
            {mockComments.map((comment) => (
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

          <div className="info-note">
            <p>Sebagai orang tua, Anda dapat melihat diskusi ini tetapi tidak dapat berpartisipasi.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
