import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Icon, Loading } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';
import { userService } from '../../services';
import './StudentPayment.css';

interface Payment {
  id: string;
  classId: string;
  className: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date | string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  receiptNumber?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: Payment['status']) => {
  switch (status) {
    case 'paid':
      return <Badge variant="success">Sudah Dibayar</Badge>;
    case 'pending':
      return <Badge variant="warning">Belum Dibayar</Badge>;
    case 'overdue':
      return <Badge variant="danger">Terlambat</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const StudentPayment = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement paymentService when available
        // For now, using empty array
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        // const paymentsData = await paymentService.getPayments({ studentId: user?.id });
        setPayments([]);
      } catch (error) {
        console.error('Error loading payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Filter payments berdasarkan kelas siswa
  const studentPayments = payments.filter((p) => p.classId === (user as any)?.classId);
  
  const paidPayments = studentPayments.filter((p) => p.status === 'paid');
  const pendingPayments = studentPayments.filter((p) => p.status === 'pending' || p.status === 'overdue');

  const displayedPayments =
    activeTab === 'paid'
      ? paidPayments
      : activeTab === 'pending'
      ? pendingPayments
      : studentPayments;

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      key: 'period',
      header: 'Periode',
      render: (item: Payment) => (
        <div>
          <strong>{item.month} {item.year}</strong>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item: Payment) => (
        <div className="payment-amount">{formatCurrency(item.amount)}</div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Jatuh Tempo',
      render: (item: Payment) => formatDate(new Date(item.dueDate)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Payment) => getStatusBadge(item.status),
    },
    {
      key: 'paymentMethod',
      header: 'Metode Pembayaran',
      render: (item: Payment) => item.paymentMethod || '-',
    },
    {
      key: 'receiptNumber',
      header: 'No. Kwitansi',
      render: (item: Payment) => item.receiptNumber || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-payment">
        <h1>Pembayaran SPP</h1>

        {/* Summary Card - Only Unpaid */}
        {pendingPayments.length > 0 && (
          <div className="payment-summary">
            <Card variant="elevated" className="summary-card summary-card--pending">
              <div className="summary-icon" style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)' }}>
                <Icon name="clock" size={20} style={{ color: '#ffcc00' }} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Belum Dibayar</div>
                <div className="summary-value">{formatCurrency(totalPending)}</div>
                <div className="summary-count">{pendingPayments.length} pembayaran</div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="payment-tabs">
          <button
            className={`tab-button ${activeTab === 'all' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua ({studentPayments.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'paid' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            Sudah Dibayar ({paidPayments.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'pending' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Belum Dibayar ({pendingPayments.length})
          </button>
        </div>

        {/* Payment Table */}
        {isLoading ? (
          <Loading />
        ) : displayedPayments.length === 0 ? (
          <EmptyState
            icon="analytics"
            title="Tidak Ada Data Pembayaran"
            message={
              activeTab === 'paid'
                ? 'Belum ada pembayaran yang telah dilakukan.'
                : activeTab === 'pending'
                ? 'Tidak ada pembayaran yang belum dibayar.'
                : 'Belum ada data pembayaran SPP.'
            }
          />
        ) : (
          <Card title="Riwayat Pembayaran" variant="elevated">
            <Table columns={columns} data={displayedPayments} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
