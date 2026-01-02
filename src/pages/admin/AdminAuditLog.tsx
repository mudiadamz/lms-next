import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './AdminAuditLog.css';

export const AdminAuditLog = () => {
  return (
    <DashboardLayout>
      <div className="admin-audit-log">
        <h1>Audit Log</h1>
        <Card title="Riwayat Aktivitas Sistem" variant="elevated">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15 Jan 2024 10:00</td>
                <td>Admin</td>
                <td>Login ke sistem</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

