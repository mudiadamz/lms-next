import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Icon, Loading, Modal, Button, FileUpload, FormSelect, FormInput } from '../../components/common';
import { formatDate, getFileUrl, getFileName } from '../../utils';
import { paymentService } from '../../services';
import './StudentPayment.css';

interface Payment {
  id: string;
  studentId: string;
  classId?: string;
  className?: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date | string;
  status: 'paid' | 'pending' | 'overdue' | 'verifying';
  paymentMethod?: string;
  receiptNumber?: string;
  receiptFileUrl?: string;
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

export const StudentPayment = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    paymentMethod: '',
    receiptNumber: '',
    receiptFile: null as File | null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // For students, use their own ID; for parents, backend will filter by their linked student_id
        const paymentsData = await paymentService.getPayments();
        setPayments(paymentsData);
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

  // Use all payments directly (already filtered by backend)
  const studentPayments = payments;
  
  const paidPayments = studentPayments.filter((p) => p.status === 'paid');
  const pendingPayments = studentPayments.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const verifyingPayments = studentPayments.filter((p) => p.status === 'verifying');

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleUploadClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setUploadFormData({
      paymentMethod: '',
      receiptNumber: '',
      receiptFile: null,
    });
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async () => {
    if (!selectedPayment || !uploadFormData.receiptFile) return;
    
    if (!uploadFormData.paymentMethod) {
      alert('Pilih metode pembayaran');
      return;
    }

    try {
      await paymentService.uploadReceipt(
        selectedPayment.id,
        uploadFormData.receiptFile,
        uploadFormData.paymentMethod,
        uploadFormData.receiptNumber || undefined
      );

      // Reload payments
      const paymentsData = await paymentService.getPayments();
      setPayments(paymentsData);
      
      setShowUploadModal(false);
      setSelectedPayment(null);
      alert('Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.');
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Gagal mengupload bukti pembayaran');
    }
  };

  const paymentMethods = settings.paymentSettings?.paymentMethods || [];
  const bankInfo = settings.paymentSettings;

  const summaryColumns = [
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
      key: 'receiptFile',
      header: 'Bukti Pembayaran',
      render: (item: Payment) => {
        if (item.receiptFileUrl) {
          const fileUrl = getFileUrl(item.receiptFileUrl);
          const fileName = getFileName(item.receiptFileUrl) || 'Bukti Pembayaran';
          const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isImage ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--ios-blue)', textDecoration: 'none' }}
                >
                  <Icon name="image" size={16} />
                  <span style={{ fontSize: '0.8125rem' }}>Lihat Bukti</span>
                </a>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--ios-blue)', textDecoration: 'none' }}
                >
                  <Icon name="download" size={16} />
                  <span style={{ fontSize: '0.8125rem' }}>Download</span>
                </a>
              )}
            </div>
          );
        }
        return <span style={{ color: '#8e8e93', fontSize: '0.8125rem' }}>-</span>;
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (item: Payment) => (
        <Button
          variant="primary"
          size="small"
          onClick={() => handleUploadClick(item)}
        >
          <Icon name="upload" size={14} style={{ marginRight: '0.25rem' }} />
          Upload Bukti
        </Button>
      ),
    },
  ];

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
    {
      key: 'receiptFile',
      header: 'Bukti Pembayaran',
      render: (item: Payment) => {
        if (item.receiptFileUrl) {
          const fileUrl = getFileUrl(item.receiptFileUrl);
          const fileName = getFileName(item.receiptFileUrl) || 'Bukti Pembayaran';
          const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isImage ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--ios-blue)', textDecoration: 'none' }}
                >
                  <Icon name="image" size={16} />
                  <span style={{ fontSize: '0.8125rem' }}>Lihat Bukti</span>
                </a>
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--ios-blue)', textDecoration: 'none' }}
                >
                  <Icon name="download" size={16} />
                  <span style={{ fontSize: '0.8125rem' }}>Download</span>
                </a>
              )}
            </div>
          );
        }
        return <span style={{ color: '#8e8e93', fontSize: '0.8125rem' }}>-</span>;
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (item: Payment) => (
        item.status === 'pending' || item.status === 'overdue' ? (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleUploadClick(item)}
          >
            <Icon name="upload" size={14} style={{ marginRight: '0.25rem' }} />
            Upload Bukti
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-payment">
        <h1>Pembayaran SPP</h1>

        {/* Payment Methods Info */}
        {bankInfo && (bankInfo.bankName || bankInfo.accountNumber) && (
          <Card variant="elevated" className="payment-methods-info">
            <div className="payment-methods-header">
              <Icon name="creditCard" size={20} />
              <h3>Informasi Pembayaran</h3>
            </div>
            <div className="payment-methods-content">
              {bankInfo.bankName && (
                <div className="payment-method-item">
                  <strong>Nama Bank:</strong> {bankInfo.bankName}
                </div>
              )}
              {bankInfo.accountHolderName && (
                <div className="payment-method-item">
                  <strong>Nama Pemegang Rekening:</strong> {bankInfo.accountHolderName}
                </div>
              )}
              {bankInfo.accountNumber && (
                <div className="payment-method-item">
                  <strong>Nomor Rekening:</strong> {bankInfo.accountNumber}
                </div>
              )}
              {paymentMethods.length > 0 && (
                <div className="payment-method-item">
                  <strong>Metode Pembayaran:</strong> {paymentMethods.join(', ')}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Summary Table - Unpaid Payments */}
        {pendingPayments.length > 0 && (
          <Card variant="elevated" className="payment-summary-table">
            <h3 className="summary-table-title">Pembayaran Belum Dibayar</h3>
            <Table columns={summaryColumns} data={pendingPayments} />
          </Card>
        )}

        {/* Verifying Payments */}
        {verifyingPayments.length > 0 && (
          <Card variant="elevated" className="payment-summary-table">
            <h3 className="summary-table-title" style={{ color: 'var(--ios-blue)' }}>
              <Icon name="clock" size={18} style={{ marginRight: '0.5rem' }} />
              Menunggu Verifikasi Admin ({verifyingPayments.length})
            </h3>
            <Table columns={columns} data={verifyingPayments} />
          </Card>
        )}

        {/* Payment History Table - Only Paid */}
        {isLoading ? (
          <Loading />
        ) : paidPayments.length === 0 ? (
          <EmptyState
            icon="analytics"
            title="Belum Ada Riwayat Pembayaran"
            message="Belum ada pembayaran yang telah dilakukan."
          />
        ) : (
          <Card title={`Riwayat Pembayaran (${paidPayments.length})`} variant="elevated">
            <Table columns={columns} data={paidPayments} />
          </Card>
        )}

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

        {/* Upload Payment Proof Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedPayment(null);
          }}
          title="Upload Bukti Pembayaran"
          size="medium"
        >
          {selectedPayment && (
            <div className="upload-payment-form">
              <div className="upload-payment-info">
                <p><strong>Periode:</strong> {selectedPayment.month} {selectedPayment.year}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(selectedPayment.amount)}</p>
                <p><strong>Jatuh Tempo:</strong> {formatDate(new Date(selectedPayment.dueDate))}</p>
              </div>

              <FormSelect
                label="Metode Pembayaran"
                value={uploadFormData.paymentMethod}
                onChange={(e) => setUploadFormData({ ...uploadFormData, paymentMethod: e.target.value })}
                options={[
                  { value: '', label: 'Pilih Metode Pembayaran' },
                  ...paymentMethods.map((method) => ({
                    value: method,
                    label: method,
                  })),
                ]}
                required
              />

              <FormInput
                label="Nomor Kwitansi (Opsional)"
                value={uploadFormData.receiptNumber}
                onChange={(e) => setUploadFormData({ ...uploadFormData, receiptNumber: e.target.value })}
                placeholder="Masukkan nomor kwitansi jika ada"
              />

              <FileUpload
                label="Bukti Pembayaran"
                accept="image/*,.pdf"
                maxSize={5}
                onFileSelect={(files) => {
                  if (files.length > 0) {
                    setUploadFormData({ ...uploadFormData, receiptFile: files[0] });
                  }
                }}
              />

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedPayment(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUploadSubmit}
                  disabled={!uploadFormData.paymentMethod || !uploadFormData.receiptFile}
                >
                  Upload Bukti
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
