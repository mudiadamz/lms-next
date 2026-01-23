import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Loading, EmptyState, Pagination } from '../../components/common';
import { auditLogService, AuditLog } from '../../services';
import './AdminAuditLog.css';

export const AdminAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await auditLogService.getAuditLogs({ 
          page: currentPage, 
          limit: itemsPerPage 
        });
        setAuditLogs(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage]);

  const paginatedLogs = auditLogs;

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <DashboardLayout>
      <div className="admin-audit-log">
        <h1>Audit Log</h1>
        {isLoading ? (
          <Loading />
        ) : auditLogs.length === 0 ? (
          <Card title="Riwayat Aktivitas Sistem" variant="elevated">
            <EmptyState
              icon="document"
              title="Tidak Ada Log"
              message="Belum ada riwayat aktivitas sistem."
            />
          </Card>
        ) : (
          <Card title="Riwayat Aktivitas Sistem" variant="elevated">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>User</th>
                  <th>Aktivitas</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.userName}</td>
                    <td>{log.action}</td>
                    <td>{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

