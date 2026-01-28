import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Pagination, ConfirmDialog, Icon, Modal, FormInput, FormSelect, Loading, EmptyState, SearchBar } from '../../components/common';
import { formatDate, getFileUrl, getFileName } from '../../utils';
import { classService, paymentService } from '../../services';
import { useSettings } from '../../contexts/SettingsContext';
import './AdminPayment.css';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber?: string;
  classId?: string;
  className?: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'verifying';
  paymentMethod?: string;
  receiptNumber?: string;
  receiptFileUrl?: string;
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
    case 'verifying':
      return <Badge variant="info">Menunggu Verifikasi</Badge>;
    case 'pending':
      return <Badge variant="warning">Belum Dibayar</Badge>;
    case 'overdue':
      return <Badge variant="danger">Terlambat</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const AdminPayment = () => {
  const { settings } = useSettings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const itemsPerPage = 10;
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
  }, []);

  const [formData, setFormData] = useState({
    selectedClasses: [] as string[],
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    dueDate: '',
    status: 'pending' as 'paid' | 'pending' | 'overdue' | 'verifying',
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

        console.log('Loaded classes:', classesData);
        console.log('Classes length:', classesData?.length);
        console.log('Is array:', Array.isArray(classesData));
        
        if (!Array.isArray(classesData)) {
          console.error('Invalid classes data (not an array):', classesData);
          setClasses([]);
        } else {
          const mappedClasses = classesData.map(c => ({ value: c.id, label: c.name }));
          console.log('Mapped classes:', mappedClasses);
          console.log('Mapped classes length:', mappedClasses.length);
          setClasses(mappedClasses);
        }
        
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        console.error('Error loading payments:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        setClasses([]);
        setPayments([]);
        // Don't show alert here, let the UI show the empty state message
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchTerm === '' || 
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.className?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesClass = selectedClass === 'all' || payment.classId === selectedClass;
    const matchesMonth = selectedMonth === 'all' || payment.month === selectedMonth;
    const matchesYear = payment.year.toString() === selectedYear;
    return matchesSearch && matchesStatus && matchesClass && matchesMonth && matchesYear;
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
      status: 'pending',
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
      selectedClasses: payment.classId ? [payment.classId] : [],
      month: payment.month,
      year: payment.year.toString(),
      amount: payment.amount.toString(),
      dueDate: payment.dueDate.toISOString().split('T')[0],
      status: payment.status,
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
      setPayments(paymentsData);
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

      if (!formData.paymentMethod || formData.paymentMethod.trim() === '') {
        alert('Pilih metode pembayaran');
        return;
      }

      try {
        setIsLoading(true);
        const createdPayments = await paymentService.createPayment({
          classIds: formData.selectedClasses,
          month: formData.month,
          year: parseInt(formData.year),
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || undefined,
        });
        
        // Reset filters to show newly created payments BEFORE reloading
        setSelectedStatus('all');
        setSelectedClass('all');
        setSelectedMonth(formData.month || 'all');
        setSelectedYear(formData.year);
        setSearchTerm('');
        setCurrentPage(1);
        
        // Reload payments after filters are updated
        const paymentsData = await paymentService.getPayments();
        setPayments(paymentsData);
        
        setShowCreateModal(false);
        
        // Reset form
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
        
        setIsLoading(false);
        alert(`Berhasil membuat ${createdPayments.length} pembayaran SPP`);
      } catch (error) {
        console.error('Error creating payment:', error);
        setIsLoading(false);
        alert('Gagal membuat pembayaran SPP');
      }
    } else if (showEditModal && selectedPayment) {
      if (formData.selectedClasses.length === 0) {
        alert('Pilih kelas');
        return;
      }
      
      await paymentService.updatePayment(selectedPayment.id, {
        classId: formData.selectedClasses[0] || undefined,
        month: formData.month,
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate),
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        receiptNumber: formData.receiptNumber || undefined,
        notes: formData.notes || undefined,
      });
      
      // Reload payments
      const paymentsData = await paymentService.getPayments();
      setPayments(paymentsData);
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
      setPayments(paymentsData);
      
      setShowDeleteDialog(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Gagal menghapus pembayaran');
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Siswa',
      render: (item: Payment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.studentName}</div>
          {item.studentNumber && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>NIS: {item.studentNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Payment) => (
        <div>
          <div>{item.className || '-'}</div>
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
      key: 'receiptFile',
      header: 'Bukti Pembayaran',
      render: (item: Payment) => {
        if (item.receiptFileUrl) {
          return (
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                setSelectedPayment(item);
                setShowReceiptModal(true);
              }}
            >
              <Icon name="eye" size={14} style={{ marginRight: '0.25rem' }} />
              Lihat Bukti
            </Button>
          );
        }
        return <span style={{ color: '#8e8e93', fontSize: '0.8125rem' }}>-</span>;
      },
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

        {/* Filters */}
        <Card variant="elevated">
          <div className="filters">
            <div className="filter-group">
              <SearchBar
                placeholder="Cari murid berdasarkan nama, NIS, atau kelas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <FormSelect
                label="Status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'verifying', label: 'Menunggu Verifikasi' },
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
                options={yearOptions}
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
          size="large"
        >
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label className="form-label">
                Pilih Kelas <span style={{ color: '#ff3b30' }}>*</span>
              </label>
              {isLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  Memuat data kelas...
                </div>
              ) : classes.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#ff3b30' }}>
                  Tidak ada kelas yang tersedia. Pastikan sudah ada kelas yang terdaftar.
                </div>
              ) : (
                <>
                  <div className="checkbox-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div className="checkbox-item checkbox-item--select-all">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.selectedClasses.length === classes.length && classes.length > 0}
                          onChange={handleSelectAllClasses}
                        />
                        <span>Pilih Semua ({classes.length} kelas)</span>
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
                  {formData.selectedClasses.length > 0 && (
                    <div style={{ color: '#34c759', fontSize: '13px', marginTop: '0.25rem' }}>
                      {formData.selectedClasses.length} kelas dipilih
                    </div>
                  )}
                </>
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
            <FormSelect
              label={
                <>
                  Metode Pembayaran <span style={{ color: '#ff3b30' }}>*</span>
                </>
              }
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: '', label: 'Pilih Metode Pembayaran' },
                ...(settings.paymentSettings?.paymentMethods || []).map((method) => ({
                  value: method,
                  label: method,
                })),
              ]}
              required
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
                ...classes.map((c) => ({ value: c.value, label: c.label })),
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
            <FormSelect
              label="Metode Pembayaran"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: '', label: 'Pilih Metode Pembayaran' },
                ...(settings.paymentSettings?.paymentMethods || []).map((method) => ({
                  value: method,
                  label: method,
                })),
              ]}
            />
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
              options={[
                { value: 'pending', label: 'Belum Dibayar' },
                { value: 'paid', label: 'Sudah Dibayar' },
                { value: 'overdue', label: 'Terlambat' },
              ]}
              required
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
          message={`Apakah Anda yakin ingin menghapus pembayaran SPP untuk ${selectedPayment?.studentName} (${selectedPayment?.month} ${selectedPayment?.year})? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />

        {/* View Receipt Modal */}
        <Modal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedPayment(null);
          }}
          title="Bukti Pembayaran"
          size="large"
        >
          {selectedPayment && selectedPayment.receiptFileUrl && (
            <div className="receipt-viewer">
              <div className="receipt-info" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--ios-secondary-background)', borderRadius: '8px' }}>
                <p><strong>Siswa:</strong> {selectedPayment.studentName}</p>
                {selectedPayment.studentNumber && <p><strong>NIS:</strong> {selectedPayment.studentNumber}</p>}
                <p><strong>Kelas:</strong> {selectedPayment.className || '-'}</p>
                <p><strong>Periode:</strong> {selectedPayment.month} {selectedPayment.year}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(selectedPayment.amount)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
                {selectedPayment.paymentMethod && <p><strong>Metode Pembayaran:</strong> {selectedPayment.paymentMethod}</p>}
                {selectedPayment.receiptNumber && <p><strong>No. Kwitansi:</strong> {selectedPayment.receiptNumber}</p>}
              </div>
              {(() => {
                const fileUrl = getFileUrl(selectedPayment.receiptFileUrl);
                const fileName = getFileName(selectedPayment.receiptFileUrl) || 'Bukti Pembayaran';
                const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const isPdf = fileName.match(/\.pdf$/i);
                
                return (
                  <div className="receipt-content">
                    {isImage ? (
                      <img 
                        src={fileUrl} 
                        alt="Bukti Pembayaran" 
                        style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px', border: '0.5px solid var(--ios-separator)' }}
                      />
                    ) : isPdf ? (
                      <iframe 
                        src={fileUrl} 
                        style={{ width: '100%', height: '600px', border: '0.5px solid var(--ios-separator)', borderRadius: '8px' }}
                        title="Bukti Pembayaran"
                      />
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <Icon name="document" size={48} style={{ color: '#8e8e93', marginBottom: '1rem' }} />
                        <p style={{ marginBottom: '1rem', color: '#8e8e93' }}>Preview tidak tersedia untuk file ini</p>
                        <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Button variant="primary">
                            <Icon name="download" size={16} style={{ marginRight: '0.5rem' }} />
                            Download Bukti Pembayaran
                          </Button>
                        </a>
                      </div>
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="small">
                          <Icon name="download" size={14} style={{ marginRight: '0.25rem' }} />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
