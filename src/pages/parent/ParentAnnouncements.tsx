import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, EmptyState, Loading } from '../../components/common';
import { announcementService } from '../../services';
import { Announcement } from '../../types';
import { formatDate, getRelativeTime } from '../../utils';
import './ParentAnnouncements.css';

export const ParentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await announcementService.getAnnouncements({ targetAudience: 'parent' });
        setAnnouncements(data);
      } catch (error) {
        console.error('Error loading announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  return (
    <DashboardLayout>
      <div className="parent-announcements">
        <h1>Pengumuman Sekolah</h1>
        
        {isLoading ? (
          <Loading />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="Tidak Ada Pengumuman"
            message="Belum ada pengumuman untuk Anda saat ini."
          />
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <Card key={announcement.id} variant="elevated" className="announcement-card">
                <div className="announcement-header">
                  {announcement.isPinned && (
                    <Badge variant="warning">📌 Pinned</Badge>
                  )}
                  <h3>{announcement.title}</h3>
                </div>
                <div className="announcement-content">
                  <p>{announcement.content}</p>
                </div>
                <div className="announcement-footer">
                  <span>{formatDate(announcement.createdAt)}</span>
                  {announcement.endDate && (
                    <span>Berlaku sampai: {formatDate(announcement.endDate)}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

