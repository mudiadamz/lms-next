import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, SearchBar, Badge, Dropdown, Pagination, ConfirmDialog, Icon, Modal, FileUpload } from '../../components/common';
import { ROLE_LABELS, SCHOOL_LEVELS, ROUTES } from '../../constants';
import './AdminUsers.css';

const mockUsers = [
  {
    id: '1',
    fullName: 'Budi Santoso',
    role: 'student',
    studentNumber: '2024001',
    schoolLevel: 'sma',
    classId: 'class1',
    phoneNumber: '081234567890',
    birthPlace: 'Jakarta',
    birthDate: '2005-05-15',
  },
  {
    id: '2',
    fullName: 'Ibu Siti',
    role: 'teacher',
    teacherNumber: '1985001',
    schoolLevel: 'sma',
    phoneNumber: '081234567891',
    birthPlace: 'Bandung',
    birthDate: '1985-03-20',
  },
  {
    id: '3',
    fullName: 'Admin Sekolah',
    role: 'admin',
    adminNumber: 'ADM001',
    schoolLevel: 'sma',
    phoneNumber: '081234567892',
    birthPlace: 'Surabaya',
    birthDate: '1980-01-10',
  },
];

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('admin');
  const [currentPage, setCurrentPage] = useState(1);

  // Read role from URL query parameter
  useEffect(() => {
    const role = searchParams.get('role') || 'admin';
    setSelectedSubMenu(role);
  }, [searchParams]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [users, setUsers] = useState(mockUsers);
  const itemsPerPage = 10;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentNumber && user.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.teacherNumber && user.teacherNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.adminNumber && user.adminNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubMenu = user.role === selectedSubMenu;
    return matchesSearch && matchesSubMenu;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleDelete = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleAddUser = () => {
    // Navigate to create page
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
      // Simulate parsing Excel file
      // In real implementation, use library like xlsx or exceljs
      handleParseExcel(file);
    }
  };

  const handleParseExcel = async (file: File) => {
    // TODO: Implement actual Excel parsing using xlsx library
    // For now, simulate with mock data
    setIsImporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock preview data based on file name
      const mockPreview = [
        {
          fullName: 'John Doe',
          username: 'john',
          email: 'john@example.com',
          role: 'student',
          schoolLevel: 'sma',
        },
        {
          fullName: 'Jane Smith',
          username: 'jane',
          email: 'jane@example.com',
          role: 'student',
          schoolLevel: 'sma',
        },
      ];
      
      setImportPreview(mockPreview);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Gagal membaca file Excel');
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
      // TODO: Call API to import users
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Add imported users to the list
      const newUsers = importPreview.map((user, index) => {
        // Get nomor induk berdasarkan role
        let numberInduk = '';
        if (user.role === 'student' && user.studentNumber) {
          numberInduk = user.studentNumber;
        } else if (user.role === 'teacher' && user.teacherNumber) {
          numberInduk = user.teacherNumber;
        } else if (user.role === 'admin' && user.adminNumber) {
          numberInduk = user.adminNumber;
        }

        const newUser: any = {
          id: Date.now().toString() + index,
          fullName: user.fullName,
          role: user.role,
          schoolLevel: user.schoolLevel,
          classId: user.role === 'student' ? 'class1' : undefined,
          // Password default sama dengan nomor induk
          password: numberInduk,
        };
        
        // Set nomor induk berdasarkan role
        if (user.role === 'student' && user.studentNumber) {
          newUser.studentNumber = user.studentNumber;
        } else if (user.role === 'teacher' && user.teacherNumber) {
          newUser.teacherNumber = user.teacherNumber;
        } else if (user.role === 'admin' && user.adminNumber) {
          newUser.adminNumber = user.adminNumber;
        }
        
        return newUser;
      });

      setUsers([...users, ...newUsers]);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      alert(`Berhasil mengimpor ${newUsers.length} user`);
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Gagal mengimpor user');
    } finally {
      setIsImporting(false);
    }
  };


  const confirmDelete = async () => {
    if (!selectedUser) return;
    // TODO: Call userService.deleteUser
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user');
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Nama',
      render: (item: typeof mockUsers[0]) => (
        <div>
          <strong>{item.fullName}</strong>
        </div>
      ),
    },
    {
      key: 'number',
      header: 'Nomor Induk',
      render: (item: typeof mockUsers[0]) => {
        if (item.role === 'student' && 'studentNumber' in item) {
          return item.studentNumber || '-';
        } else if (item.role === 'teacher' && 'teacherNumber' in item) {
          return item.teacherNumber || '-';
        } else if (item.role === 'admin' && 'adminNumber' in item) {
          return item.adminNumber || '-';
        }
        return '-';
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: typeof mockUsers[0]) => (
        <Badge variant={item.role === 'admin' ? 'danger' : item.role === 'teacher' ? 'primary' : 'secondary'}>
          {ROLE_LABELS[item.role]}
        </Badge>
      ),
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat',
      render: (item: typeof mockUsers[0]) => {
        const levels: Record<string, string> = {
          sd: 'SD',
          smp: 'SMP',
          sma: 'SMA',
        };
        return levels[item.schoolLevel] || '-';
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockUsers[0]) => (
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
            placeholder="Cari user..."
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
              <h4>Format File Excel:</h4>
              <p>File Excel harus memiliki kolom berikut:</p>
              <ul>
                <li><strong>Nama Lengkap</strong> - Nama lengkap user</li>
                <li><strong>Nomor Induk Siswa (NIS)</strong> - Untuk role student (password default sama dengan NIS)</li>
                <li><strong>Nomor Induk Pengajar (NIP)</strong> - Untuk role teacher (password default sama dengan NIP)</li>
                <li><strong>Nomor Induk Admin</strong> - Untuk role admin (password default sama dengan Nomor Induk Admin)</li>
                <li><strong>Role</strong> - admin, teacher, student, atau parent</li>
                <li><strong>Tingkat Sekolah</strong> - sd, smp, atau sma (opsional)</li>
              </ul>
              <p style={{ marginTop: '0.75rem', fontSize: '13px', color: '#6b7280' }}>
                <strong>Catatan:</strong> Password default untuk pengguna baru adalah nomor induk mereka. Pengguna dapat mengubah password setelah login pertama kali.
              </p>
            </div>

            <FileUpload
              accept=".xlsx,.xls"
              maxSize={5}
              onFileSelect={handleFileSelect}
              multiple={false}
            />

            {isImporting && (
              <div className="import-loading">
                <p>Memproses file Excel...</p>
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="import-preview">
                <h4>Preview Data ({importPreview.length} user):</h4>
                <div className="preview-table">
                  <Table
                    columns={[
                      { key: 'fullName', header: 'Nama' },
                      {
                        key: 'number',
                        header: 'Nomor Induk',
                        render: (item: any) => {
                          if (item.role === 'student' && item.studentNumber) {
                            return item.studentNumber;
                          } else if (item.role === 'teacher' && item.teacherNumber) {
                            return item.teacherNumber;
                          } else if (item.role === 'admin' && item.adminNumber) {
                            return item.adminNumber;
                          }
                          return '-';
                        },
                      },
                      {
                        key: 'role',
                        header: 'Role',
                        render: (item: any) => (
                          <Badge variant={item.role === 'admin' ? 'danger' : item.role === 'teacher' ? 'primary' : 'secondary'}>
                            {ROLE_LABELS[item.role] || item.role}
                          </Badge>
                        ),
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

