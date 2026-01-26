import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormTextarea, FormSelect, Icon } from '../../components/common';
import { useSettings } from '../../contexts/SettingsContext';
import './AdminSettings.css';

export const AdminSettings = () => {
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

  const tabs = [
    { id: 'info', label: 'Info', icon: 'info' },
    { id: 'payment', label: 'Pembayaran', icon: 'analytics' },
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
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
