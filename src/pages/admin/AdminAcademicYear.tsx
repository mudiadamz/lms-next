import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, SearchBar, Table, Badge, Dropdown, Modal, FormInput, FormSelect, ConfirmDialog, Icon, EmptyState } from '../../components/common';
import { AcademicYear } from '../../types';
import './AdminAcademicYear.css';

// Contoh data tahun ajaran
const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: '2024-2025',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-06-30'),
    isActive: true,
  },
  {
    id: '2',
    name: '2023-2024',
    startDate: new Date('2023-07-01'),
    endDate: new Date('2024-06-30'),
    isActive: false,
  },
  {
    id: '3',
    name: '2022-2023',
    startDate: new Date('2022-07-01'),
    endDate: new Date('2023-06-30'),
    isActive: false,
  },
];

export const AdminAcademicYear = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(mockAcademicYears);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const filteredAcademicYears = academicYears.filter((year) =>
    year.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAcademicYear = academicYears.find((year) => year.isActive);

  const handleCreate = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (year: AcademicYear) => {
    setSelectedAcademicYear(year);
    setFormData({
      name: year.name,
      startDate: year.startDate && !isNaN(year.startDate.getTime()) 
        ? year.startDate.toISOString().split('T')[0] 
        : '',
      endDate: year.endDate && !isNaN(year.endDate.getTime())
        ? year.endDate.toISOString().split('T')[0]
        : '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (year: AcademicYear) => {
    setSelectedAcademicYear(year);
    setShowDeleteDialog(true);
  };

  const handleActivate = (year: AcademicYear) => {
    setSelectedAcademicYear(year);
    setShowActivateDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (showEditModal && selectedAcademicYear) {
        // Update existing academic year
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          alert('Tanggal tidak valid');
          return;
        }
        
        const updatedYear: AcademicYear = {
          ...selectedAcademicYear,
          name: formData.name,
          startDate: startDate,
          endDate: endDate,
        };
        setAcademicYears(academicYears.map((y) => (y.id === selectedAcademicYear.id ? updatedYear : y)));
      } else {
        // Create new academic year
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          alert('Tanggal tidak valid');
          return;
        }
        
        const newYear: AcademicYear = {
          id: Date.now().toString(),
          name: formData.name,
          startDate: startDate,
          endDate: endDate,
          isActive: false,
        };
        setAcademicYears([...academicYears, newYear]);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
      });
      setSelectedAcademicYear(null);
    } catch (error) {
      console.error('Error saving academic year:', error);
      alert('Gagal menyimpan tahun ajaran');
    }
  };

  const confirmDelete = async () => {
    if (!selectedAcademicYear) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAcademicYears(academicYears.filter((y) => y.id !== selectedAcademicYear.id));
      setShowDeleteDialog(false);
      setSelectedAcademicYear(null);
    } catch (error) {
      console.error('Error deleting academic year:', error);
      alert('Gagal menghapus tahun ajaran');
    }
  };

  const confirmActivate = async () => {
    if (!selectedAcademicYear) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Deactivate all years first, then activate selected one
      setAcademicYears(
        academicYears.map((y) => ({
          ...y,
          isActive: y.id === selectedAcademicYear.id,
        }))
      );
      setShowActivateDialog(false);
      setSelectedAcademicYear(null);
    } catch (error) {
      console.error('Error activating academic year:', error);
      alert('Gagal mengaktifkan tahun ajaran');
    }
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Tahun Ajaran',
      render: (item: AcademicYear) => (
        <div>
          <strong>{item.name}</strong>
          {item.isActive && (
            <Badge variant="success" style={{ marginLeft: '0.5rem' }}>
              Aktif
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Tanggal Mulai',
      render: (item: AcademicYear) => formatDate(item.startDate),
    },
    {
      key: 'endDate',
      header: 'Tanggal Selesai',
      render: (item: AcademicYear) => formatDate(item.endDate),
    },
    {
      key: 'duration',
      header: 'Durasi',
      render: (item: AcademicYear) => {
        const months = Math.round(
          (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        return `${months} bulan`;
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: AcademicYear) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            ...(item.isActive
              ? []
              : [{ label: 'Aktifkan', onClick: () => handleActivate(item) }]),
            { label: 'Edit', onClick: () => handleEdit(item) },
            { divider: true },
            { label: 'Hapus', onClick: () => handleDelete(item) },
          ]}
          align="right"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-academic-year">
        <div className="page-header">
          <h1>Manajemen Tahun Ajaran</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Tambah Tahun Ajaran
          </Button>
        </div>

        {activeAcademicYear && (
          <Card title="Tahun Ajaran Aktif" variant="elevated" style={{ marginBottom: '1.5rem' }}>
            <div className="active-year-info">
              <div className="active-year-name">
                <strong>{activeAcademicYear.name}</strong>
                <Badge variant="success" style={{ marginLeft: '0.5rem' }}>
                  Aktif
                </Badge>
              </div>
              <div className="active-year-dates">
                <span>{formatDate(activeAcademicYear.startDate)}</span>
                <span style={{ margin: '0 0.5rem' }}>sampai</span>
                <span>{formatDate(activeAcademicYear.endDate)}</span>
              </div>
            </div>
          </Card>
        )}

        <div className="page-filters">
          <SearchBar
            placeholder="Cari tahun ajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredAcademicYears.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Tidak Ada Tahun Ajaran"
            message={searchTerm
              ? 'Tidak ada tahun ajaran yang sesuai dengan pencarian.'
              : 'Belum ada tahun ajaran yang terdaftar.'}
            action={{
              label: 'Tambah Tahun Ajaran',
              onClick: handleCreate,
            }}
          />
        ) : (
          <Card title={`Daftar Tahun Ajaran (${filteredAcademicYears.length})`} variant="elevated">
            <Table columns={columns} data={filteredAcademicYears} />
          </Card>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              name: '',
              startDate: '',
              endDate: '',
            });
          }}
          title="Tambah Tahun Ajaran"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="academic-year-form">
            <FormInput
              label="Nama Tahun Ajaran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: 2024-2025"
              required
            />
            <div className="form-row">
              <FormInput
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormInput
                label="Tanggal Selesai"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
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
            setSelectedAcademicYear(null);
          }}
          title="Edit Tahun Ajaran"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="academic-year-form">
            <FormInput
              label="Nama Tahun Ajaran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="form-row">
              <FormInput
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormInput
                label="Tanggal Selesai"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
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
            setSelectedAcademicYear(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Tahun Ajaran"
          message={`Apakah Anda yakin ingin menghapus tahun ajaran "${selectedAcademicYear?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={showActivateDialog}
          onClose={() => {
            setShowActivateDialog(false);
            setSelectedAcademicYear(null);
          }}
          onConfirm={confirmActivate}
          title="Aktifkan Tahun Ajaran"
          message={`Apakah Anda yakin ingin mengaktifkan tahun ajaran "${selectedAcademicYear?.name}"? Tahun ajaran yang sedang aktif akan dinonaktifkan.`}
          confirmLabel="Aktifkan"
          variant="primary"
        />
      </div>
    </DashboardLayout>
  );
};
