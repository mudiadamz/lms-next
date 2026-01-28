import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, SearchBar, Badge, Dropdown, Pagination, ConfirmDialog, Icon, Modal, FileUpload, Loading, FormSelect } from '../../components/common';
import { ROLE_LABELS, SCHOOL_LEVELS, ROUTES } from '../../constants';
import { userService, excelService, academicYearService, classService, subjectService } from '../../services';
import { formatDate } from '../../utils/dateUtils';
import './AdminUsers.css';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailUser, setDetailUser] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTeacherSubjects, setDetailTeacherSubjects] = useState<string[]>([]);
  const [detailTeacherClasses, setDetailTeacherClasses] = useState<string[]>([]);
  const [isLoadingTeacherDetail, setIsLoadingTeacherDetail] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [usersByRole, setUsersByRole] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string; isActive?: boolean }>>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(false);
  const [homeroomClassMap, setHomeroomClassMap] = useState<Record<string, string>>({});
  const [classInfoMap, setClassInfoMap] = useState<Record<string, { name: string; grade: number }>>({});
  const itemsPerPage = 10;

  const roleParam = (searchParams.get('role') || 'admin').toLowerCase();
  const selectedSubMenu = (['admin', 'teacher', 'student'].includes(roleParam) ? roleParam : 'admin') as 'admin' | 'teacher' | 'student';

  useEffect(() => {
    const loadUsers = async () => {
      const currentRole = selectedSubMenu;
      try {
        setIsLoading(true);
        const usersData = await userService.getUsers(currentRole as any);
        if (currentRole !== selectedSubMenu) return;
        const normalizedUsers = usersData.map((user: any) => ({
          ...user,
          role: user.role || currentRole,
          fullName: user.fullName || '',
          email: user.email || '',
          studentNumber: user.studentNumber || '',
          teacherNumber: user.teacherNumber || '',
          adminNumber: user.adminNumber || '',
        }));
        setUsersByRole((prev) => ({ ...prev, [currentRole]: normalizedUsers }));
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        if (currentRole === selectedSubMenu) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();
  }, [selectedSubMenu]);

  useEffect(() => {
    const loadAcademicYears = async () => {
      if (selectedSubMenu !== 'student') return;
      try {
        setIsLoadingAcademicYears(true);
        const data = await academicYearService.getAcademicYears();
        const options = data.map((year) => ({
          value: year.id,
          label: year.name,
          isActive: year.isActive,
        }));
        setAcademicYears(options);
        const activeYear = options.find((year) => year.isActive);
        if (activeYear) {
          setSelectedAcademicYearId(activeYear.value);
        } else if (options.length > 0 && !selectedAcademicYearId) {
          setSelectedAcademicYearId(options[0].value);
        }
      } catch (error) {
        console.error('Error loading academic years:', error);
        setAcademicYears([]);
      } finally {
        setIsLoadingAcademicYears(false);
      }
    };

    loadAcademicYears();
  }, [selectedSubMenu]);

  useEffect(() => {
    const loadClasses = async () => {
      if (selectedSubMenu !== 'teacher' && selectedSubMenu !== 'student') {
        setHomeroomClassMap({});
        setClassInfoMap({});
        return;
      }
      try {
        const classesData = await classService.getClasses();
        const homeroomMap: Record<string, string> = {};
        const infoMap: Record<string, { name: string; grade: number }> = {};
        classesData.forEach((cls: any) => {
          infoMap[cls.id] = { name: cls.name, grade: cls.grade };
          if (cls.homeroomTeacherId && !homeroomMap[cls.homeroomTeacherId]) {
            homeroomMap[cls.homeroomTeacherId] = cls.name;
          }
        });
        setHomeroomClassMap(homeroomMap);
        setClassInfoMap(infoMap);
      } catch (error) {
        console.error('Error loading classes:', error);
        setHomeroomClassMap({});
        setClassInfoMap({});
      }
    };

    loadClasses();
  }, [selectedSubMenu]);

  // Reset filters when switching submenu
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedSubMenu]);

  const users = usersByRole[selectedSubMenu] || [];
  const filteredUsers = users.filter((user) => {
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(searchValue) ||
      (user.studentNumber || '').toLowerCase().includes(searchValue) ||
      (user.teacherNumber || '').toLowerCase().includes(searchValue) ||
      (user.adminNumber || '').toLowerCase().includes(searchValue) ||
      (user.email || '').toLowerCase().includes(searchValue);
    return matchesSearch;
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
      setUsersByRole((prev) => ({
        ...prev,
        [selectedSubMenu]: (prev[selectedSubMenu] || []).filter((u) => u.id !== selectedUser.id),
      }));
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

  const handleEdit = (user: any) => {
    navigate(ROUTES.ADMIN_USERS_EDIT.replace(':id', user.id));
  };

  const handleDetail = (user: any) => {
    setDetailUser(user);
    setDetailTeacherSubjects([]);
    setDetailTeacherClasses([]);
    setShowDetailModal(true);
    if (user.role === 'teacher') {
      setIsLoadingTeacherDetail(true);
      subjectService.getSubjects(undefined, user.id)
        .then((subjectsData) => {
          const subjectNames = subjectsData.map((subject) => subject.name);
          const classIds = new Set<string>();
          subjectsData.forEach((subject) => {
            (subject.classIds || []).forEach((classId) => classIds.add(classId));
          });
          const classNames = Array.from(classIds)
            .map((classId) => classInfoMap[classId]?.name || classId);
          setDetailTeacherSubjects(subjectNames);
          setDetailTeacherClasses(classNames);
        })
        .catch((error) => {
          console.error('Error loading teacher detail:', error);
        })
        .finally(() => setIsLoadingTeacherDetail(false));
    }
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    const defaultPassword =
      selectedUser.studentNumber ||
      selectedUser.teacherNumber ||
      selectedUser.adminNumber ||
      'password';

    try {
      setIsResettingPassword(true);
      await userService.updateUser(selectedUser.id, { password: defaultPassword });
      setShowResetDialog(false);
      setSelectedUser(null);
      alert('Password berhasil direset');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Gagal mereset password');
    } finally {
      setIsResettingPassword(false);
    }
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
          phoneNumber: String(row['No. HP'] || row['no_hp'] || row['Phone'] || '').trim(),
          birthPlace: String(row['Tempat Lahir'] || row['tempat_lahir'] || row['Birth Place'] || '').trim(),
          birthDate: String(row['Tanggal Lahir'] || row['tanggal_lahir'] || row['Birth Date'] || '').trim(),
          address: String(row['Alamat'] || row['alamat'] || row['Address'] || '').trim(),
        };
        if (selectedSubMenu !== 'teacher' && selectedSubMenu !== 'admin') {
          user.schoolLevel = String(row['Tingkat Sekolah'] || row['tingkat_sekolah'] || row['School Level'] || '')
            .trim()
            .toLowerCase();
        }

        if (selectedSubMenu === 'student') {
          user.studentNumber = String(row['NIS'] || row['nis'] || row['Student Number'] || '').trim();
          user.classId = String(
            row['Kelas ID'] ||
              row['kelas_id'] ||
              row['Class ID'] ||
              row['Kelas'] ||
              row['kelas'] ||
              row['Class'] ||
              ''
          ).trim();
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
    if (selectedSubMenu === 'student' && !selectedAcademicYearId) {
      alert('Pilih tahun ajaran terlebih dahulu');
      return;
    }

    setIsImporting(true);
    try {
      const result = await excelService.importUsers(
        importFile,
        selectedSubMenu,
        selectedSubMenu === 'student' ? selectedAcademicYearId : undefined
      );
      
      if (result.success > 0) {
        const errorMessages = result.errors && result.errors.length > 0 
          ? `\n\nError detail:\n${result.errors.map(e => `Baris ${e.row}: ${e.error}`).join('\n')}`
          : '';
        
        alert(`Berhasil mengimpor ${result.success} pengguna${result.failed > 0 ? `. ${result.failed} gagal.` : ''}${errorMessages}`);
        
        // Reload users list
        const usersData = await userService.getUsers(selectedSubMenu as any);
        setUsersByRole((prev) => ({ ...prev, [selectedSubMenu]: usersData }));
        
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
      render: (item: any) => {
        const roleLabel = ROLE_LABELS[item.role as keyof typeof ROLE_LABELS] || item.role;
        return <Badge variant="secondary">{roleLabel}</Badge>;
      },
    },
    {
      key: 'number',
      header: 'Nomor Induk',
      render: (item: any) => item.studentNumber || item.teacherNumber || item.adminNumber || '-',
    },
    {
      key: 'schoolLevel',
      header: selectedSubMenu === 'teacher' ? 'Wali Kelas' : selectedSubMenu === 'student' ? 'Kelas' : 'Tingkat',
      render: (item: any) => {
        if (item.role === 'teacher') {
          return homeroomClassMap[item.id] || '-';
        }
        if (item.role === 'student') {
          const classInfo = item.classId ? classInfoMap[item.classId] : null;
          if (!classInfo) return '-';
          return `Kelas ${classInfo.grade}`;
        }
        const level = item.schoolLevel as keyof typeof SCHOOL_LEVELS;
        return level ? SCHOOL_LEVELS[level] : '-';
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            { label: 'Detail', onClick: () => handleDetail(item) },
            { label: 'Edit', onClick: () => handleEdit(item) },
            { label: 'Reset Password', onClick: () => handleResetPassword(item) },
            { label: 'divider', onClick: () => {}, divider: true },
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
  const tableColumns = selectedSubMenu === 'admin'
    ? columns.filter((column) => column.key !== 'schoolLevel')
    : columns;

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
                <span style={{ marginRight: '0.25rem' }}>
                  <Icon name="upload" size={16} />
                </span>
                Import Excel
              </Button>
              <Button onClick={handleAddUser} size="small">
                {getButtonLabel()}
              </Button>
            </div>
          }
        >
          {isLoading ? (
            <div style={{ padding: '2rem' }}>
              <Loading message="Memuat pengguna..." />
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Tidak ada user yang ditemukan
            </div>
          ) : (
            <>
              <Table columns={tableColumns} data={paginatedUsers} />
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
            setSelectedAcademicYearId('');
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
                  <span style={{ marginRight: '0.25rem' }}>
                    <Icon name="download" size={16} />
                  </span>
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
                    <li><strong>Kelas / Kelas ID</strong> - Nama kelas atau ID kelas (opsional)</li>
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

            {selectedSubMenu === 'student' && (
              <div style={{ marginBottom: '1rem' }}>
                <FormSelect
                  label="Tahun Ajaran"
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  options={[
                    { value: '', label: isLoadingAcademicYears ? 'Memuat tahun ajaran...' : 'Pilih tahun ajaran' },
                    ...academicYears.map((year) => ({
                      value: year.value,
                      label: year.isActive ? `${year.label} (Aktif)` : year.label,
                    })),
                  ]}
                  required
                />
                <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#6b7280' }}>
                  Kelas yang dipilih di file Excel harus sesuai dengan tahun ajaran ini.
                </p>
              </div>
            )}

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
                  setSelectedAcademicYearId('');
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
        <ConfirmDialog
          isOpen={showResetDialog}
          onClose={() => {
            setShowResetDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmResetPassword}
          title="Reset Password"
          message={`Reset password untuk "${selectedUser?.fullName}" ke password default?`}
          confirmLabel={isResettingPassword ? 'Mereset...' : 'Reset'}
          variant="warning"
        />

        <Modal
          isOpen={showDetailModal && !!detailUser}
          onClose={() => {
            setShowDetailModal(false);
            setDetailUser(null);
            setDetailTeacherSubjects([]);
            setDetailTeacherClasses([]);
          }}
          title="Detail Pengguna"
          size="medium"
        >
          {detailUser && (
            <div className="user-detail">
              <div className="user-detail-row">
                <span className="user-detail-label">Nama</span>
                <span className="user-detail-value">{detailUser.fullName || '-'}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Role</span>
                <span className="user-detail-value">
                  {ROLE_LABELS[detailUser.role as keyof typeof ROLE_LABELS] || detailUser.role}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Nomor Induk</span>
                <span className="user-detail-value">
                  {detailUser.studentNumber || detailUser.teacherNumber || detailUser.adminNumber || '-'}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Email</span>
                <span className="user-detail-value">{detailUser.email || '-'}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">No. HP</span>
                <span className="user-detail-value">{detailUser.phoneNumber || '-'}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Kelas / Wali Kelas</span>
                <span className="user-detail-value">
                  {detailUser.role === 'student'
                    ? (detailUser.classId && classInfoMap[detailUser.classId]
                      ? `Kelas ${classInfoMap[detailUser.classId].grade}`
                      : '-')
                    : detailUser.role === 'teacher'
                      ? (homeroomClassMap[detailUser.id] || '-')
                      : '-'}
                </span>
              </div>
              {detailUser.role === 'teacher' && (
                <>
                  <div className="user-detail-row">
                    <span className="user-detail-label">Kelas yang Diajar</span>
                    <span className="user-detail-value">
                      {isLoadingTeacherDetail
                        ? 'Memuat...'
                        : detailTeacherClasses.length > 0
                          ? detailTeacherClasses.join(', ')
                          : '-'}
                    </span>
                  </div>
                  <div className="user-detail-row">
                    <span className="user-detail-label">Mata Pelajaran yang Diajar</span>
                    <span className="user-detail-value">
                      {isLoadingTeacherDetail
                        ? 'Memuat...'
                        : detailTeacherSubjects.length > 0
                          ? detailTeacherSubjects.join(', ')
                          : '-'}
                    </span>
                  </div>
                </>
              )}
              <div className="user-detail-row">
                <span className="user-detail-label">Jenis Kelamin</span>
                <span className="user-detail-value">
                  {detailUser.gender === 'male'
                    ? 'Laki-laki'
                    : detailUser.gender === 'female'
                      ? 'Perempuan'
                      : '-'}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Tempat, Tanggal Lahir</span>
                <span className="user-detail-value">
                  {detailUser.birthPlace || '-'}{detailUser.birthDate ? `, ${formatDate(detailUser.birthDate)}` : ''}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Alamat</span>
                <span className="user-detail-value">{detailUser.address || '-'}</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

