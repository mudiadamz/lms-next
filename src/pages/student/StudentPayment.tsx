import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Icon } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';
import './StudentPayment.css';

interface Payment {
  id: string;
  classId: string;
  className: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  receiptNumber?: string;
}

// Mock payments untuk kelas class1 (X IPA 1) - sesuai dengan user mock di AuthContext
const mockPayments: Payment[] = [
  {
    id: '1',
    classId: 'class1',
    className: 'X IPA 1',
    month: 'Januari',
    year: 2024,
    amount: 500000,
    dueDate: new Date('2024-01-10'),
    status: 'paid',
    paymentMethod: 'Transfer Bank',
    receiptNumber: 'RCP-2024-001',
  },
  {
    id: '2',
    classId: 'class1',
    className: 'X IPA 1',
    month: 'Februari',
    year: 2024,
    amount: 500000,
    dueDate: new Date('2024-02-10'),
    status: 'pending',
  },
];

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
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  // Filter payments berdasarkan kelas siswa
  const studentPayments = mockPayments.filter((p) => p.classId === user?.classId);
  
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
      render: (item: Payment) => formatDate(item.dueDate),
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

        {/* Summary Cards */}
        <div className="payment-summary">
          <Card variant="elevated" className="summary-card summary-card--paid">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={24} style={{ color: '#34c759' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Sudah Dibayar</div>
              <div className="summary-value">{formatCurrency(totalPaid)}</div>
              <div className="summary-count">{paidPayments.length} pembayaran</div>
            </div>
          </Card>

          <Card variant="elevated" className="summary-card summary-card--pending">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)' }}>
              <Icon name="clock" size={24} style={{ color: '#ffcc00' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Belum Dibayar</div>
              <div className="summary-value">{formatCurrency(totalPending)}</div>
              <div className="summary-count">{pendingPayments.length} pembayaran</div>
            </div>
          </Card>

          <Card variant="elevated" className="summary-card summary-card--total">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Icon name="analytics" size={24} style={{ color: '#007aff' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total SPP</div>
              <div className="summary-value">{formatCurrency(totalPaid + totalPending)}</div>
              <div className="summary-count">{studentPayments.length} pembayaran</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="payment-tabs">
          <button
            className={`tab-button ${activeTab === 'all' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua
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
        {displayedPayments.length === 0 ? (
          <EmptyState
            icon="checkCircle"
            title="Tidak Ada Data Pembayaran"
            message={
              activeTab === 'paid'
                ? 'Belum ada pembayaran yang telah dilakukan.'
                : activeTab === 'pending'
                ? 'Semua pembayaran sudah lunas.'
                : 'Belum ada data pembayaran yang tersedia.'
            }
          />
        ) : (
          <Card
            title={
              activeTab === 'paid'
                ? `Pembayaran yang Sudah Dibayar (${paidPayments.length})`
                : activeTab === 'pending'
                ? `Pembayaran yang Belum Dibayar (${pendingPayments.length})`
                : `Riwayat Pembayaran SPP (${displayedPayments.length})`
            }
            variant="elevated"
          >
            <Table columns={columns} data={displayedPayments} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
