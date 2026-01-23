import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormTextarea, FormSelect } from '../../components/common';
import { useSettings } from '../../contexts/SettingsContext';
import './AdminSettings.css';

export const AdminSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    schoolLevel: '' as 'sd' | 'smp' | 'sma' | '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData({
      schoolName: settings.schoolName,
      address: settings.address,
      schoolLevel: settings.schoolLevel || '',
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      // Note: Settings are managed via SettingsContext
      // In a real implementation, this would call an API
      updateSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-settings">
        <h1>Pengaturan Sistem</h1>

        <Card title="Informasi Sekolah" variant="elevated">
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
        </Card>

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
      </div>
    </DashboardLayout>
  );
};
