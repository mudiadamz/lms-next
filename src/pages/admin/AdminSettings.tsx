import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormTextarea, FormSelect, Icon, Table, SearchBar, Badge, Dropdown, Pagination, ConfirmDialog, Modal, FileUpload, Loading } from '../../components/common';
import { useSettings } from '../../contexts/SettingsContext';
import { userService, excelService } from '../../services';
import { ROUTES } from '../../constants';
import './AdminSettings.css';

export const AdminSettings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<string>('info');
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    schoolLevel: '' as 'sd' | 'smp' | 'sma' | '',
  });
  const [paymentSettings, setPaymentSettings] = useState({
    defaultAmount: '',
    defaultDueDay: '1',
    autoGenerate: false,
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    paymentMethods: [] as string[],
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Admin management state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const adminItemsPerPage = 10;

  useEffect(() => {
    setFormData({
      schoolName: settings.schoolName,
      address: settings.address,
      schoolLevel: settings.schoolLevel || '',
    });
    
    if (settings.paymentSettings) {
      setPaymentSettings({
        defaultAmount: settings.paymentSettings.defaultAmount?.toString() || '',
        defaultDueDay: settings.paymentSettings.defaultDueDay?.toString() || '1',
        autoGenerate: settings.paymentSettings.autoGenerate || false,
        bankName: settings.paymentSettings.bankName || '',
        accountHolderName: settings.paymentSettings.accountHolderName || '',
        accountNumber: settings.paymentSettings.accountNumber || '',
        paymentMethods: settings.paymentSettings.paymentMethods || [],
      });
    }
  }, [settings]);

  // Load admin users when admin tab is active
  useEffect(() => {
    const loadAdminUsers = async () => {
      if (activeTab !== 'admin') return;
      try {
        setIsLoadingAdmins(true);
        const usersData = await userService.getUsers('admin');
        setAdminUsers(usersData);
      } catch (error) {
        console.error('Error loading admin users:', error);
      } finally {
        setIsLoadingAdmins(false);
      }
    };

    loadAdminUsers();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await updateSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await updateSettings({
        paymentSettings: {
          defaultAmount: paymentSettings.defaultAmount ? parseFloat(paymentSettings.defaultAmount) : undefined,
          defaultDueDay: paymentSettings.defaultDueDay ? parseInt(paymentSettings.defaultDueDay) : undefined,
          autoGenerate: paymentSettings.autoGenerate,
          bankName: paymentSettings.bankName,
          accountHolderName: paymentSettings.accountHolderName,
          accountNumber: paymentSettings.accountNumber,
          paymentMethods: paymentSettings.paymentMethods,
        },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert('Gagal menyimpan pengaturan pembayaran');
    } finally {
      setIsSaving(false);
    }
  };

  // Admin management functions
  const filteredAdmins = adminUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (user.adminNumber && user.adminNumber.toLowerCase().includes(adminSearchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(adminSearchTerm.toLowerCase()));
    return matchesSearch;
  });

  const paginatedAdmins = filteredAdmins.slice(
    (adminCurrentPage - 1) * adminItemsPerPage,
    adminCurrentPage * adminItemsPerPage
  );

  const adminTotalPages = Math.ceil(filteredAdmins.length / adminItemsPerPage);

  const handleDeleteAdmin = (user: any) => {
    setSelectedAdmin(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await userService.deleteUser(selectedAdmin.id);
      setAdminUsers(adminUsers.filter(u => u.id !== selectedAdmin.id));
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Gagal menghapus admin');
    }
  };

  const handleAddAdmin = () => {
    navigate(`${ROUTES.ADMIN_USERS}/create/admin`);
  };

  const handleEditAdmin = (user: any) => {
    navigate(ROUTES.ADMIN_USERS_EDIT.replace(':id', user.id));
  };

  const handleResetPassword = (user: any) => {
    setSelectedAdmin(user);
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedAdmin) return;
    const defaultPassword = selectedAdmin.adminNumber || 'password';

    try {
      setIsResettingPassword(true);
      await userService.updateUser(selectedAdmin.id, { password: defaultPassword });
      setShowResetDialog(false);
      setSelectedAdmin(null);
      alert('Password berhasil direset');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Gagal mereset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImportFile(file);
      handleParseExcel(file);
    }
  };

  const handleParseExcel = async (file: File) => {
    setIsImporting(true);
    try {
      const parsedData = await excelService.parseExcelFile(file);
      
      const mappedData = parsedData.map((row: any) => ({
        username: String(row['Username'] || row['username'] || '').trim(),
        fullName: String(row['Nama Lengkap'] || row['nama_lengkap'] || row['Nama'] || row['nama'] || '').trim(),
        email: String(row['Email'] || row['email'] || '').trim(),
        role: 'admin',
        phoneNumber: String(row['No. HP'] || row['no_hp'] || row['Phone'] || '').trim(),
        birthPlace: String(row['Tempat Lahir'] || row['tempat_lahir'] || row['Birth Place'] || '').trim(),
        birthDate: String(row['Tanggal Lahir'] || row['tanggal_lahir'] || row['Birth Date'] || '').trim(),
        address: String(row['Alamat'] || row['alamat'] || row['Address'] || '').trim(),
        adminNumber: String(row['NIP Admin'] || row['nip_admin'] || row['Admin Number'] || '').trim(),
      })).filter((user: any) => user.fullName && user.username);

      if (mappedData.length === 0) {
        alert('Tidak ada data yang valid ditemukan di file Excel.');
      }

      setImportPreview(mappedData);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Gagal membaca file Excel.');
      setImportPreview([]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAdmins = async () => {
    if (!importFile || importPreview.length === 0) {
      alert('Pilih file Excel terlebih dahulu');
      return;
    }

    setIsImporting(true);
    try {
      const result = await excelService.importUsers(importFile, 'admin');
      
      if (result.success > 0) {
        const errorMessages = result.errors && result.errors.length > 0 
          ? `\n\nError detail:\n${result.errors.map((e: any) => `Baris ${e.row}: ${e.error}`).join('\n')}`
          : '';
        
        alert(`Berhasil mengimpor ${result.success} admin${result.failed > 0 ? `. ${result.failed} gagal.` : ''}${errorMessages}`);
        
        const usersData = await userService.getUsers('admin');
        setAdminUsers(usersData);
        
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
      } else {
        const errorMessages = result.errors && result.errors.length > 0
          ? result.errors.map((e: any) => `Baris ${e.row}: ${e.error}`).join('\n')
          : 'Tidak ada data yang berhasil diimpor';
        alert(`Gagal mengimpor admin.\n\n${errorMessages}`);
      }
    } catch (error: any) {
      console.error('Error importing admins:', error);
      alert(`Gagal mengimpor admin: ${error.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const adminColumns = [
    {
      key: 'fullName',
      header: 'Nama',
      render: (item: any) => (
        <div>
          <strong>{item.fullName}</strong>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {item.email}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: () => <Badge variant="secondary">Admin</Badge>,
    },
    {
      key: 'number',
      header: 'NIP Admin',
      render: (item: any) => item.adminNumber || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            { label: 'Edit', onClick: () => handleEditAdmin(item) },
            { label: 'Reset Password', onClick: () => handleResetPassword(item) },
            { label: 'divider', onClick: () => {}, divider: true },
            { label: 'Hapus', onClick: () => handleDeleteAdmin(item) },
          ]}
          align="right"
        />
      ),
    },
  ];

  const tabs = [
    { id: 'info', label: 'Info', icon: 'info' },
    { id: 'payment', label: 'Pembayaran', icon: 'analytics' },
    { id: 'admin', label: 'Admin', icon: 'user' },
    { id: 'other', label: 'Lainnya', icon: 'settings' },
  ];

  return (
    <DashboardLayout>
      <div className="admin-settings">
        <div className="page-header">
          <h1>Pengaturan Sistem</h1>
        </div>

        <Card variant="elevated">
          <div className="settings-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon as any} size={18} style={{ marginRight: '0.5rem' }} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="settings-content">
            {/* Tab: Info */}
            {activeTab === 'info' && (
              <div className="tab-content">
                <form onSubmit={handleSubmit} className="settings-form">
                  <FormInput
                    label="Nama Sekolah"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="Masukkan nama sekolah"
                    required
                  />

                  <FormTextarea
                    label="Alamat"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masukkan alamat sekolah"
                    rows={4}
                  />

                  <FormSelect
                    label="Tingkat Sekolah"
                    value={formData.schoolLevel}
                    onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value as 'sd' | 'smp' | 'sma' | '' })}
                    options={[
                      { value: '', label: 'Pilih tingkat sekolah' },
                      { value: 'sd', label: 'SD (Sekolah Dasar)' },
                      { value: 'smp', label: 'SMP (Sekolah Menengah Pertama)' },
                      { value: 'sma', label: 'SMA (Sekolah Menengah Atas)' },
                    ]}
                  />

                  {isSaved && (
                    <div className="settings-saved-message">
                      ✓ Pengaturan berhasil disimpan
                    </div>
                  )}

                  <div className="settings-actions">
                    <Button type="submit" isLoading={isSaving}>
                      Simpan Pengaturan
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Pembayaran */}
            {activeTab === 'payment' && (
              <div className="tab-content">
                <form onSubmit={handlePaymentSubmit} className="settings-form">
                  <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Pembayaran SPP</h3>
                  
                  <div className="form-section">
                    <h4 className="form-section-title">Informasi Bank</h4>
                    <FormInput
                      label="Nama Bank"
                      value={paymentSettings.bankName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                      placeholder="Contoh: Bank BCA, Bank Mandiri, dll"
                    />

                    <FormInput
                      label="Nama Pemegang Rekening"
                      value={paymentSettings.accountHolderName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, accountHolderName: e.target.value })}
                      placeholder="Nama pemegang rekening"
                    />

                    <FormInput
                      label="Nomor Rekening"
                      value={paymentSettings.accountNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                      placeholder="Nomor rekening bank"
                    />
                  </div>

                  <div className="form-section">
                    <h4 className="form-section-title">Metode Pembayaran</h4>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <FormInput
                          label=""
                          value={newPaymentMethod}
                          onChange={(e) => setNewPaymentMethod(e.target.value)}
                          placeholder="Masukkan metode pembayaran (contoh: Transfer Bank, Tunai, E-Wallet)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newPaymentMethod.trim();
                              if (trimmed) {
                                if (paymentSettings.paymentMethods.includes(trimmed)) {
                                  alert('Metode pembayaran sudah ada');
                                } else {
                                  setPaymentSettings({
                                    ...paymentSettings,
                                    paymentMethods: [...paymentSettings.paymentMethods, trimmed],
                                  });
                                  setNewPaymentMethod('');
                                }
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const trimmed = newPaymentMethod.trim();
                            if (trimmed) {
                              if (paymentSettings.paymentMethods.includes(trimmed)) {
                                alert('Metode pembayaran sudah ada');
                              } else {
                                setPaymentSettings({
                                  ...paymentSettings,
                                  paymentMethods: [...paymentSettings.paymentMethods, trimmed],
                                });
                                setNewPaymentMethod('');
                              }
                            }
                          }}
                          style={{ marginTop: '1.5rem', minWidth: '80px' }}
                        >
                          Tambah
                        </Button>
                      </div>
                      {paymentSettings.paymentMethods.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {paymentSettings.paymentMethods.map((method, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.375rem 0.75rem',
                                background: 'var(--ios-secondary-background)',
                                borderRadius: '8px',
                                border: '0.5px solid var(--ios-separator)',
                              }}
                            >
                              <span>{method}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentSettings({
                                    ...paymentSettings,
                                    paymentMethods: paymentSettings.paymentMethods.filter((_, i) => i !== index),
                                  });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff3b30',
                                  cursor: 'pointer',
                                  padding: '0',
                                  fontSize: '18px',
                                  lineHeight: '1',
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                          Belum ada metode pembayaran. Tambahkan metode pembayaran yang tersedia.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="form-section">
                    <h4 className="form-section-title">Pengaturan Default</h4>
                    <FormInput
                      label="Jumlah Default SPP (Rp)"
                      type="number"
                      value={paymentSettings.defaultAmount}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultAmount: e.target.value })}
                      placeholder="Contoh: 500000"
                    />

                    <FormSelect
                      label="Tanggal Jatuh Tempo Default"
                      value={paymentSettings.defaultDueDay}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultDueDay: e.target.value })}
                      options={Array.from({ length: 28 }, (_, i) => ({
                        value: String(i + 1),
                        label: `Tanggal ${i + 1}`,
                      }))}
                    />

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={paymentSettings.autoGenerate}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, autoGenerate: e.target.checked })}
                        />
                        <span>Otomatis generate pembayaran setiap bulan</span>
                      </label>
                    </div>
                  </div>

                  {isSaved && (
                    <div className="settings-saved-message">
                      ✓ Pengaturan pembayaran berhasil disimpan
                    </div>
                  )}

                  <div className="settings-actions">
                    <Button type="submit" isLoading={isSaving}>
                      Simpan Pengaturan
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Admin */}
            {activeTab === 'admin' && (
              <div className="tab-content">
                <div className="admin-management-section">
                  <div className="admin-section-header">
                    <h3>Manajemen Admin</h3>
                    <div className="admin-header-actions">
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => setShowImportModal(true)}
                      >
                        <span style={{ marginRight: '0.25rem' }}>
                          <Icon name="upload" size={16} />
                        </span>
                        Import Excel
                      </Button>
                      <Button onClick={handleAddAdmin} size="small">
                        Tambah Admin
                      </Button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <SearchBar
                      placeholder="Cari admin berdasarkan nama, NIP, atau email..."
                      value={adminSearchTerm}
                      onChange={(e) => {
                        setAdminSearchTerm(e.target.value);
                        setAdminCurrentPage(1);
                      }}
                    />
                  </div>

                  {isLoadingAdmins ? (
                    <div style={{ padding: '2rem' }}>
                      <Loading message="Memuat data admin..." />
                    </div>
                  ) : paginatedAdmins.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      Tidak ada admin yang ditemukan
                    </div>
                  ) : (
                    <>
                      <Table columns={adminColumns} data={paginatedAdmins} />
                      {adminTotalPages > 1 && (
                        <Pagination
                          currentPage={adminCurrentPage}
                          totalPages={adminTotalPages}
                          onPageChange={setAdminCurrentPage}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Lainnya */}
            {activeTab === 'other' && (
              <div className="tab-content">
                <div className="settings-info">
                  <h3>Pengaturan Lainnya</h3>
                  <p>Pengaturan tambahan akan ditambahkan di sini.</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Info Card */}
        {activeTab === 'info' && (
          <Card title="Informasi" variant="elevated">
            <div className="settings-info">
              <p>
                <strong>Nama Sekolah</strong> akan ditampilkan di:
              </p>
              <ul>
                <li>Header aplikasi (sebagai title)</li>
                <li>Halaman login</li>
                <li>Semua halaman dashboard</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                <strong>Alamat Sekolah</strong> dapat digunakan untuk:
              </p>
              <ul>
                <li>Laporan dan dokumen resmi</li>
                <li>Informasi kontak sekolah</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                <strong>Tingkat Sekolah</strong> menentukan level pendidikan yang digunakan di sistem ini. Pilih tingkat sekolah yang sesuai (SD, SMP, atau SMA).
              </p>
            </div>
          </Card>
        )}

        {/* Import Admin Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview([]);
          }}
          title="Import Admin dari Excel"
          size="large"
        >
          <div className="import-modal-content">
            <div className="import-instructions">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Format File Excel:</h4>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => excelService.downloadExample('admin')}
                >
                  <span style={{ marginRight: '0.25rem' }}>
                    <Icon name="download" size={16} />
                  </span>
                  Download Template Excel
                </Button>
              </div>
              <p>File Excel harus memiliki kolom berikut:</p>
              <ul>
                <li><strong>NIP Admin</strong> - Nomor Induk Admin (wajib)</li>
                <li><strong>Username</strong> - Username untuk login (wajib)</li>
                <li><strong>Password</strong> - Password untuk login (wajib)</li>
                <li><strong>Nama Lengkap</strong> - Nama lengkap admin (wajib)</li>
                <li><strong>Email</strong> - Email admin (opsional)</li>
                <li><strong>No. HP</strong> - Nomor HP (opsional)</li>
                <li><strong>Tempat Lahir</strong> - Tempat lahir (opsional)</li>
                <li><strong>Tanggal Lahir</strong> - Format: YYYY-MM-DD (opsional)</li>
                <li><strong>Alamat</strong> - Alamat lengkap (opsional)</li>
              </ul>
            </div>

            <FileUpload
              accept=".xlsx,.xls"
              maxSize={5}
              onFileSelect={handleFileSelect}
              multiple={false}
            />

            {isImporting && importPreview.length === 0 && (
              <div className="import-loading">
                <Loading message="Memproses file Excel..." />
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="import-preview">
                <h4>Preview Data ({importPreview.length} admin):</h4>
                <div className="preview-table">
                  <Table
                    columns={[
                      { key: 'fullName', header: 'Nama' },
                      { key: 'username', header: 'Username', render: (item: any) => item.username || '-' },
                      { key: 'adminNumber', header: 'NIP Admin', render: (item: any) => item.adminNumber || '-' },
                      { key: 'email', header: 'Email', render: (item: any) => item.email || '-' },
                    ]}
                    data={importPreview}
                  />
                </div>
              </div>
            )}

            <div className="modal-footer">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                disabled={isImporting}
              >
                Batal
              </Button>
              <Button
                onClick={handleImportAdmins}
                isLoading={isImporting}
                disabled={!importFile || importPreview.length === 0}
              >
                Import {importPreview.length > 0 ? `${importPreview.length} ` : ''}Admin
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedAdmin(null);
          }}
          onConfirm={confirmDeleteAdmin}
          title="Hapus Admin"
          message={`Apakah Anda yakin ingin menghapus admin "${selectedAdmin?.fullName}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
        <ConfirmDialog
          isOpen={showResetDialog}
          onClose={() => {
            setShowResetDialog(false);
            setSelectedAdmin(null);
          }}
          onConfirm={confirmResetPassword}
          title="Reset Password"
          message={`Reset password untuk "${selectedAdmin?.fullName}" ke password default?`}
          confirmLabel={isResettingPassword ? 'Mereset...' : 'Reset'}
          variant="warning"
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
