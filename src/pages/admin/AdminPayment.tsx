import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Pagination, ConfirmDialog, Icon, Modal, FormInput, FormSelect, Loading, EmptyState } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';
import { classService, paymentService } from '../../services';
import './AdminPayment.css';

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
  notes?: string;
  createdAt: Date;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
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

export const AdminPayment = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    selectedClasses: [] as string[],
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    dueDate: '',
    paymentMethod: '',
    receiptNumber: '',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [paymentsData, classesData] = await Promise.all([
          paymentService.getPayments(),
          classService.getClasses(),
        ]);

        // Map payments with class names
        const paymentsWithClassNames = paymentsData.map(payment => {
          const classInfo = classesData.find(c => c.id === payment.classId);
          return {
            ...payment,
            className: classInfo?.name || payment.className || '-',
          };
        });

        setPayments(paymentsWithClassNames);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error('Error loading payments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesClass = selectedClass === 'all' || payment.classId === selectedClass;
    const matchesMonth = selectedMonth === 'all' || payment.month === selectedMonth;
    const matchesYear = payment.year.toString() === selectedYear;
    return matchesStatus && matchesClass && matchesMonth && matchesYear;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handleCreate = () => {
    setFormData({
      selectedClasses: [],
      month: '',
      year: new Date().getFullYear().toString(),
      amount: '',
      dueDate: '',
      paymentMethod: '',
      receiptNumber: '',
      notes: '',
    });
    setShowCreateModal(true);
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedClasses.includes(classId);
      return {
        ...prev,
        selectedClasses: isSelected
          ? prev.selectedClasses.filter((id) => id !== classId)
          : [...prev.selectedClasses, classId],
      };
    });
  };

  const handleSelectAllClasses = () => {
    const allClassIds = classes.map((c) => c.value);
    setFormData((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.length === allClassIds.length ? [] : allClassIds,
    }));
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormData({
      selectedClasses: [payment.classId],
      month: payment.month,
      year: payment.year.toString(),
      amount: payment.amount.toString(),
      dueDate: payment.dueDate.toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod || '',
      receiptNumber: payment.receiptNumber || '',
      notes: payment.notes || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteDialog(true);
  };

  const handleMarkAsPaid = async (payment: Payment) => {
    try {
      await paymentService.updatePayment(payment.id, {
        status: 'paid',
        paymentMethod: payment.paymentMethod || 'Tunai',
        receiptNumber: payment.receiptNumber || `RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`,
      });
      
      // Reload payments
      const paymentsData = await paymentService.getPayments();
      const classesData = await classService.getClasses();
      const paymentsWithClassNames = paymentsData.map(p => {
        const classInfo = classesData.find(c => c.id === p.classId);
        return {
          ...p,
          className: classInfo?.name || p.className || '-',
        };
      });
      setPayments(paymentsWithClassNames);
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Gagal memperbarui status pembayaran');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showCreateModal) {
      if (formData.selectedClasses.length === 0) {
        alert('Pilih minimal satu kelas');
        return;
      }

      const createdPayments = await paymentService.createPayment({
        classIds: formData.selectedClasses,
        month: formData.month,
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
      });
      
      // Reload payments
      const paymentsData = await paymentService.getPayments();
      const classesData = await classService.getClasses();
      const paymentsWithClassNames = paymentsData.map(p => {
        const classInfo = classesData.find(c => c.id === p.classId);
        return {
          ...p,
          className: classInfo?.name || p.className || '-',
        };
      });
      setPayments(paymentsWithClassNames);
      setShowCreateModal(false);
    } else if (showEditModal && selectedPayment) {
      if (formData.selectedClasses.length === 0) {
        alert('Pilih minimal satu kelas');
        return;
      }
      
      await paymentService.updatePayment(selectedPayment.id, {
        classId: formData.selectedClasses[0],
        month: formData.month,
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate),
        paymentMethod: formData.paymentMethod || undefined,
        receiptNumber: formData.receiptNumber || undefined,
        notes: formData.notes || undefined,
      });
      
      // Reload payments
      const paymentsData = await paymentService.getPayments();
      const classesData = await classService.getClasses();
      const paymentsWithClassNames = paymentsData.map(p => {
        const classInfo = classesData.find(c => c.id === p.classId);
        return {
          ...p,
          className: classInfo?.name || p.className || '-',
        };
      });
      setPayments(paymentsWithClassNames);
      setShowEditModal(false);
      setSelectedPayment(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    try {
      await paymentService.deletePayment(selectedPayment.id);
      
      // Reload payments
      const paymentsData = await paymentService.getPayments();
      const classesData = await classService.getClasses();
      const paymentsWithClassNames = paymentsData.map(p => {
        const classInfo = classesData.find(c => c.id === p.classId);
        return {
          ...p,
          className: classInfo?.name || p.className || '-',
        };
      });
      setPayments(paymentsWithClassNames);
      
      setShowDeleteDialog(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Gagal menghapus pembayaran');
    }
  };

  const columns = [
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Payment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.className}</div>
        </div>
      ),
    },
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
      header: 'Metode',
      render: (item: Payment) => item.paymentMethod || '-',
    },
    {
      key: 'receiptNumber',
      header: 'No. Kwitansi',
      render: (item: Payment) => item.receiptNumber || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Payment) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            {
              label: 'Edit',
              onClick: () => handleEdit(item),
            },
            ...(item.status !== 'paid'
              ? [
                  {
                    label: 'Tandai Sudah Dibayar',
                    onClick: () => handleMarkAsPaid(item),
                  },
                ]
              : []),
            {
              label: 'Hapus',
              onClick: () => handleDelete(item),
              divider: true,
            },
          ]}
          align="right"
        />
      ),
    },
  ];

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="admin-payment">
        <div className="page-header">
          <h1>Manajemen Pembayaran SPP</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={18} style={{ marginRight: '0.5rem' }} />
            Tambah Pembayaran
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="payment-summary">
          <Card variant="elevated" className="summary-card summary-card--paid">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={24} style={{ color: '#34c759' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Sudah Dibayar</div>
              <div className="summary-value">{formatCurrency(totalPaid)}</div>
              <div className="summary-count">{payments.filter((p) => p.status === 'paid').length} pembayaran</div>
            </div>
          </Card>

          <Card variant="elevated" className="summary-card summary-card--pending">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)' }}>
              <Icon name="clock" size={24} style={{ color: '#ffcc00' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Belum Dibayar</div>
              <div className="summary-value">{formatCurrency(totalPending)}</div>
              <div className="summary-count">
                {payments.filter((p) => p.status === 'pending' || p.status === 'overdue').length} pembayaran
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="summary-card summary-card--total">
            <div className="summary-icon" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Icon name="analytics" size={24} style={{ color: '#007aff' }} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total SPP</div>
              <div className="summary-value">{formatCurrency(totalPaid + totalPending)}</div>
              <div className="summary-count">{payments.length} pembayaran</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="elevated">
          <div className="filters">
            <div className="filter-group">
              <FormSelect
                label="Status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'paid', label: 'Sudah Dibayar' },
                  { value: 'pending', label: 'Belum Dibayar' },
                  { value: 'overdue', label: 'Terlambat' },
                ]}
              />
              <FormSelect
                label="Kelas"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'Semua Kelas' },
                  ...classes.map((cls) => ({ value: cls.value, label: cls.label })),
                ]}
              />
              <FormSelect
                label="Bulan"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'Semua Bulan' },
                  ...MONTHS.map((month) => ({ value: month, label: month })),
                ]}
              />
              <FormSelect
                label="Tahun"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2023', label: '2023' },
                  { value: '2025', label: '2025' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Payment Table */}
        {isLoading ? (
          <Loading />
        ) : paginatedPayments.length === 0 ? (
          <Card variant="elevated">
            <EmptyState
              icon="analytics"
              title="Tidak Ada Data Pembayaran"
              message={selectedStatus !== 'all' || selectedClass !== 'all' || selectedMonth !== 'all'
                ? 'Tidak ada data pembayaran yang sesuai dengan filter yang dipilih.'
                : 'Belum ada data pembayaran SPP.'}
            />
          </Card>
        ) : (
          <Card title={`Daftar Pembayaran SPP (${filteredPayments.length})`} variant="elevated">
            <Table columns={columns} data={paginatedPayments} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Pembayaran SPP"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label className="form-label">
                Pilih Kelas <span style={{ color: '#ff3b30' }}>*</span>
              </label>
              <div className="checkbox-group">
                <div className="checkbox-item checkbox-item--select-all">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.selectedClasses.length === classes.length && classes.length > 0}
                      onChange={handleSelectAllClasses}
                    />
                    <span>Pilih Semua</span>
                  </label>
                </div>
                <div className="checkbox-divider"></div>
                {classes.map((cls) => (
                  <div key={cls.value} className="checkbox-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.selectedClasses.includes(cls.value)}
                        onChange={() => handleClassToggle(cls.value)}
                      />
                      <span>{cls.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {formData.selectedClasses.length === 0 && (
                <div style={{ color: '#ff3b30', fontSize: '13px', marginTop: '0.25rem' }}>
                  Pilih minimal satu kelas
                </div>
              )}
            </div>
            <div className="form-row">
              <FormSelect
                label="Bulan"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                options={[
                  { value: '', label: 'Pilih Bulan' },
                  ...MONTHS.map((month) => ({ value: month, label: month })),
                ]}
                required
              />
              <FormInput
                label="Tahun"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Jumlah (Rp)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <FormInput
                label="Jatuh Tempo"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <FormInput
              label="Metode Pembayaran (Opsional)"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="Contoh: Transfer Bank, Tunai"
            />
            <FormInput
              label="No. Kwitansi (Opsional)"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPayment(null);
          }}
          title="Edit Pembayaran SPP"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="payment-form">
            <FormSelect
              label="Kelas"
              value={formData.selectedClasses[0] || ''}
              onChange={(e) => setFormData({ ...formData, selectedClasses: e.target.value ? [e.target.value] : [] })}
              options={[
                { value: '', label: 'Pilih Kelas' },
                ...classes.map((cls) => ({ value: cls.value, label: cls.label })),
              ]}
              required
            />
            <div className="form-row">
              <FormSelect
                label="Bulan"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                options={[
                  { value: '', label: 'Pilih Bulan' },
                  ...MONTHS.map((month) => ({ value: month, label: month })),
                ]}
                required
              />
              <FormInput
                label="Tahun"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Jumlah (Rp)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <FormInput
                label="Jatuh Tempo"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <FormInput
              label="Metode Pembayaran"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />
            <FormInput
              label="No. Kwitansi"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedPayment(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Pembayaran"
          message={`Apakah Anda yakin ingin menghapus pembayaran SPP untuk ${selectedPayment?.className} (${selectedPayment?.month} ${selectedPayment?.year})? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};
