import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, SearchBar, Badge, Dropdown, Pagination, ConfirmDialog, Icon, Modal, FileUpload, Loading } from '../../components/common';
import { ROLE_LABELS, SCHOOL_LEVELS, ROUTES } from '../../constants';
import { userService, excelService } from '../../services';
import './AdminUsers.css';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('admin');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const role = searchParams.get('role') || 'admin';
    setSelectedSubMenu(role);
  }, [searchParams]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const usersData = await userService.getUsers(selectedSubMenu as any);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedSubMenu]);

  // Reset filters when switching submenu
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedSubMenu]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentNumber && user.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.teacherNumber && user.teacherNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.adminNumber && user.adminNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubMenu = user.role === selectedSubMenu;
    return matchesSearch && matchesSubMenu;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus pengguna');
    }
  };

  const handleAddUser = () => {
    navigate(`${ROUTES.ADMIN_USERS}/create/${selectedSubMenu}`);
  };

  const getButtonLabel = () => {
    switch (selectedSubMenu) {
      case 'admin':
        return 'Tambah Admin';
      case 'student':
        return 'Tambah Murid';
      case 'teacher':
        return 'Tambah Guru';
      default:
        return 'Tambah Pengguna';
    }
  };

  const getPageTitle = () => {
    switch (selectedSubMenu) {
      case 'admin':
        return 'Manajemen Admin';
      case 'student':
        return 'Manajemen Murid';
      case 'teacher':
        return 'Manajemen Guru';
      default:
        return 'Manajemen Pengguna';
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
      
      // Map parsed data to user format based on role
      const mappedData = parsedData.map((row: any) => {
        const user: any = {
          username: String(row['Username'] || row['username'] || '').trim(),
          fullName: String(row['Nama Lengkap'] || row['nama_lengkap'] || row['Nama'] || row['nama'] || '').trim(),
          email: String(row['Email'] || row['email'] || '').trim(),
          role: selectedSubMenu,
          schoolLevel: String(row['Tingkat Sekolah'] || row['tingkat_sekolah'] || row['School Level'] || '').trim().toLowerCase(),
          phoneNumber: String(row['No. HP'] || row['no_hp'] || row['Phone'] || '').trim(),
          birthPlace: String(row['Tempat Lahir'] || row['tempat_lahir'] || row['Birth Place'] || '').trim(),
          birthDate: String(row['Tanggal Lahir'] || row['tanggal_lahir'] || row['Birth Date'] || '').trim(),
          address: String(row['Alamat'] || row['alamat'] || row['Address'] || '').trim(),
        };

        if (selectedSubMenu === 'student') {
          user.studentNumber = String(row['NIS'] || row['nis'] || row['Student Number'] || '').trim();
          user.classId = String(row['Kelas ID'] || row['kelas_id'] || row['Class ID'] || '').trim();
        } else if (selectedSubMenu === 'teacher') {
          user.teacherNumber = String(row['NIP'] || row['nip'] || row['Teacher Number'] || '').trim();
        } else if (selectedSubMenu === 'admin') {
          user.adminNumber = String(row['NIP Admin'] || row['nip_admin'] || row['Admin Number'] || '').trim();
        }

        return user;
      }).filter((user: any) => user.fullName && user.username); // Filter out empty rows

      if (mappedData.length === 0) {
        alert('Tidak ada data yang valid ditemukan di file Excel. Pastikan kolom Nama Lengkap dan Username terisi.');
      }

      setImportPreview(mappedData);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Gagal membaca file Excel. Pastikan format file benar dan file tidak rusak.');
      setImportPreview([]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile || importPreview.length === 0) {
      alert('Pilih file Excel terlebih dahulu');
      return;
    }

    setIsImporting(true);
    try {
      const result = await excelService.importUsers(importFile, selectedSubMenu);
      
      if (result.success > 0) {
        const errorMessages = result.errors && result.errors.length > 0 
          ? `\n\nError detail:\n${result.errors.map(e => `Baris ${e.row}: ${e.error}`).join('\n')}`
          : '';
        
        alert(`Berhasil mengimpor ${result.success} pengguna${result.failed > 0 ? `. ${result.failed} gagal.` : ''}${errorMessages}`);
        
        // Reload users list
        const usersData = await userService.getUsers(selectedSubMenu as any);
        setUsers(usersData);
        
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
      } else {
        const errorMessages = result.errors && result.errors.length > 0
          ? result.errors.map(e => `Baris ${e.row}: ${e.error}`).join('\n')
          : 'Tidak ada data yang berhasil diimpor';
        alert(`Gagal mengimpor pengguna.\n\n${errorMessages}`);
      }
    } catch (error: any) {
      console.error('Error importing users:', error);
      alert(`Gagal mengimpor pengguna: ${error.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const columns = [
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
      render: (item: any) => <Badge variant="secondary">{ROLE_LABELS[item.role] || item.role}</Badge>,
    },
    {
      key: 'number',
      header: 'Nomor Induk',
      render: (item: any) => item.studentNumber || item.teacherNumber || item.adminNumber || '-',
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat',
      render: (item: any) => item.schoolLevel ? SCHOOL_LEVELS[item.schoolLevel] : '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            { label: 'Edit', onClick: () => console.log('Edit', item.id) },
            { label: 'Reset Password', onClick: () => console.log('Reset password', item.id) },
            { divider: true },
            {
              label: 'Hapus',
              onClick: () => handleDelete(item),
            },
          ]}
          align="right"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-users">
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
        </div>


        <div className="page-filters">
          <SearchBar
            placeholder={
              selectedSubMenu === 'student' 
                ? 'Cari murid berdasarkan nama, NIS, atau email...'
                : selectedSubMenu === 'teacher'
                ? 'Cari guru berdasarkan nama, NIP, atau email...'
                : 'Cari pengguna berdasarkan nama atau email...'
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Card 
          title={`Daftar Pengguna (${filteredUsers.length})`} 
          variant="elevated"
          headerAction={
            <div className="card-header-actions">
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setShowImportModal(true)}
              >
                <Icon name="upload" size={16} style={{ marginRight: '0.25rem' }} />
                Import Excel
              </Button>
              <Button onClick={handleAddUser} size="small">
                {getButtonLabel()}
              </Button>
            </div>
          }
        >
          {paginatedUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Tidak ada user yang ditemukan
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedUsers} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </Card>

        {/* Import Excel Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview([]);
          }}
          title="Import Pengguna dari Excel"
          size="large"
        >
          <div className="import-modal-content">
            <div className="import-instructions">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Format File Excel:</h4>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => excelService.downloadExample(selectedSubMenu as any)}
                >
                  <Icon name="download" size={16} style={{ marginRight: '0.25rem' }} />
                  Download Template Excel
                </Button>
              </div>
              <p>File Excel harus memiliki kolom berikut:</p>
              <ul>
                {selectedSubMenu === 'student' && (
                  <>
                    <li><strong>NIS</strong> - Nomor Induk Siswa (wajib)</li>
                    <li><strong>Username</strong> - Username untuk login (wajib)</li>
                    <li><strong>Password</strong> - Password untuk login (wajib)</li>
                    <li><strong>Nama Lengkap</strong> - Nama lengkap siswa (wajib)</li>
                    <li><strong>Email</strong> - Email siswa (opsional)</li>
                    <li><strong>Tingkat Sekolah</strong> - sd, smp, atau sma (opsional)</li>
                    <li><strong>Kelas ID</strong> - ID kelas siswa (opsional)</li>
                    <li><strong>No. HP</strong> - Nomor HP (opsional)</li>
                    <li><strong>Tempat Lahir</strong> - Tempat lahir (opsional)</li>
                    <li><strong>Tanggal Lahir</strong> - Format: YYYY-MM-DD (opsional)</li>
                    <li><strong>Alamat</strong> - Alamat lengkap (opsional)</li>
                  </>
                )}
                {selectedSubMenu === 'teacher' && (
                  <>
                    <li><strong>NIP</strong> - Nomor Induk Pengajar (wajib)</li>
                    <li><strong>Username</strong> - Username untuk login (wajib)</li>
                    <li><strong>Password</strong> - Password untuk login (wajib)</li>
                    <li><strong>Nama Lengkap</strong> - Nama lengkap guru (wajib)</li>
                    <li><strong>Email</strong> - Email guru (opsional)</li>
                    <li><strong>Tingkat Sekolah</strong> - sd, smp, atau sma (opsional)</li>
                    <li><strong>No. HP</strong> - Nomor HP (opsional)</li>
                    <li><strong>Tempat Lahir</strong> - Tempat lahir (opsional)</li>
                    <li><strong>Tanggal Lahir</strong> - Format: YYYY-MM-DD (opsional)</li>
                    <li><strong>Alamat</strong> - Alamat lengkap (opsional)</li>
                  </>
                )}
                {selectedSubMenu === 'admin' && (
                  <>
                    <li><strong>NIP Admin</strong> - Nomor Induk Admin (wajib)</li>
                    <li><strong>Username</strong> - Username untuk login (wajib)</li>
                    <li><strong>Password</strong> - Password untuk login (wajib)</li>
                    <li><strong>Nama Lengkap</strong> - Nama lengkap admin (wajib)</li>
                    <li><strong>Email</strong> - Email admin (opsional)</li>
                    <li><strong>Tingkat Sekolah</strong> - sd, smp, atau sma (opsional)</li>
                    <li><strong>No. HP</strong> - Nomor HP (opsional)</li>
                    <li><strong>Tempat Lahir</strong> - Tempat lahir (opsional)</li>
                    <li><strong>Tanggal Lahir</strong> - Format: YYYY-MM-DD (opsional)</li>
                    <li><strong>Alamat</strong> - Alamat lengkap (opsional)</li>
                  </>
                )}
              </ul>
              <p style={{ marginTop: '0.75rem', fontSize: '13px', color: '#6b7280' }}>
                <strong>Catatan:</strong> Kolom dengan label (wajib) harus diisi. Pastikan username unik dan tidak duplikat.
              </p>
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
                <h4>Preview Data ({importPreview.length} pengguna):</h4>
                <div className="preview-table">
                  <Table
                    columns={[
                      { key: 'fullName', header: 'Nama' },
                      {
                        key: 'username',
                        header: 'Username',
                        render: (item: any) => item.username || '-',
                      },
                      {
                        key: 'number',
                        header: 'Nomor Induk',
                        render: (item: any) => {
                          if (selectedSubMenu === 'student' && item.studentNumber) {
                            return item.studentNumber;
                          } else if (selectedSubMenu === 'teacher' && item.teacherNumber) {
                            return item.teacherNumber;
                          } else if (selectedSubMenu === 'admin' && item.adminNumber) {
                            return item.adminNumber;
                          }
                          return '-';
                        },
                      },
                      {
                        key: 'email',
                        header: 'Email',
                        render: (item: any) => item.email || '-',
                      },
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
                onClick={handleImportUsers}
                isLoading={isImporting}
                disabled={!importFile || importPreview.length === 0}
              >
                Import {importPreview.length > 0 ? `${importPreview.length} ` : ''}Pengguna
              </Button>
            </div>
          </div>
        </Modal>


        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Pengguna"
          message={`Apakah Anda yakin ingin menghapus pengguna "${selectedUser?.fullName}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};

