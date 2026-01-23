import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FileUpload, Icon, FormTextarea, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { classService, userService } from '../../services';
import './AdminUsers.css';

// Mock data untuk dropdown
const PROVINCES = [
  { value: 'jabar', label: 'Jawa Barat' },
  { value: 'jateng', label: 'Jawa Tengah' },
  { value: 'jatim', label: 'Jawa Timur' },
  { value: 'dki', label: 'DKI Jakarta' },
  { value: 'banten', label: 'Banten' },
  { value: 'yogyakarta', label: 'DI Yogyakarta' },
];

const CITIES: Record<string, Array<{ value: string; label: string }>> = {
  jabar: [
    { value: 'bandung', label: 'Bandung' },
    { value: 'bekasi', label: 'Bekasi' },
    { value: 'depok', label: 'Depok' },
    { value: 'bogor', label: 'Bogor' },
  ],
  jateng: [
    { value: 'semarang', label: 'Semarang' },
    { value: 'surakarta', label: 'Surakarta' },
    { value: 'magelang', label: 'Magelang' },
  ],
  jatim: [
    { value: 'surabaya', label: 'Surabaya' },
    { value: 'malang', label: 'Malang' },
    { value: 'sidoarjo', label: 'Sidoarjo' },
  ],
  dki: [
    { value: 'jakarta_selatan', label: 'Jakarta Selatan' },
    { value: 'jakarta_utara', label: 'Jakarta Utara' },
    { value: 'jakarta_barat', label: 'Jakarta Barat' },
    { value: 'jakarta_timur', label: 'Jakarta Timur' },
    { value: 'jakarta_pusat', label: 'Jakarta Pusat' },
  ],
  banten: [
    { value: 'tangerang', label: 'Tangerang' },
    { value: 'serang', label: 'Serang' },
  ],
  yogyakarta: [
    { value: 'yogyakarta', label: 'Yogyakarta' },
  ],
};

const DISTRICTS: Record<string, Array<{ value: string; label: string }>> = {
  bandung: [
    { value: 'coblong', label: 'Coblong' },
    { value: 'sukajadi', label: 'Sukajadi' },
    { value: 'cidadap', label: 'Cidadap' },
  ],
  jakarta_selatan: [
    { value: 'kebayoran_baru', label: 'Kebayoran Baru' },
    { value: 'kebayoran_lama', label: 'Kebayoran Lama' },
  ],
};

const VILLAGES: Record<string, Array<{ value: string; label: string }>> = {
  coblong: [
    { value: 'dago', label: 'Dago' },
    { value: 'ledeng', label: 'Ledeng' },
  ],
};

export const AdminUsersCreate = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const selectedRole = role || 'admin';
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [parents, setParents] = useState<Array<{ value: string; label: string }>>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    teacherNumber: '',
    adminNumber: '',
    schoolLevel: '',
    phoneNumber: '',
    birthPlace: '',
    birthDate: '',
    province: '',
    city: '',
    district: '',
    village: '',
    fullAddress: '',
    classId: '',
    parentId: '',
    kkFile: null as File | null,
    ktpFile: null as File | null,
    photoFile: null as File | null,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, parentsData] = await Promise.all([
          classService.getClasses(),
          userService.getUsers('parent'),
        ]);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setParents(parentsData.map(p => ({ value: p.id, label: p.fullName })));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Cleanup photo preview URL
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  // Update photo preview when photoFile changes
  useEffect(() => {
    if (formData.photoFile && formData.photoFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(formData.photoFile);
      setPhotoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreviewUrl(null);
    }
  }, [formData.photoFile]);

  const getPageTitle = () => {
    switch (selectedRole) {
      case 'student':
        return 'Tambah Murid';
      case 'teacher':
        return 'Tambah Guru';
      case 'admin':
        return 'Tambah Admin';
      default:
        return 'Tambah Pengguna';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Get nomor induk berdasarkan role
      let numberInduk = '';
      if (selectedRole === 'student') {
        numberInduk = formData.studentNumber;
      } else if (selectedRole === 'teacher') {
        numberInduk = formData.teacherNumber;
      } else if (selectedRole === 'admin') {
        numberInduk = formData.adminNumber;
      }

      const address = formData.fullAddress 
        ? `${formData.fullAddress}${formData.village ? `, ${formData.village}` : ''}${formData.district ? `, ${formData.district}` : ''}${formData.city ? `, ${formData.city}` : ''}${formData.province ? `, ${formData.province}` : ''}`
        : undefined;

      await userService.createUser({
        fullName: formData.fullName,
        email: formData.fullName.toLowerCase().replace(/\s+/g, '.') + '@school.com', // Generate email
        password: numberInduk,
        role: selectedRole as 'student' | 'teacher' | 'admin' | 'parent',
        phoneNumber: formData.phoneNumber || undefined,
        address: address,
        birthPlace: formData.birthPlace || undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        schoolLevel: formData.schoolLevel || undefined,
        studentNumber: selectedRole === 'student' ? formData.studentNumber : undefined,
        teacherNumber: selectedRole === 'teacher' ? formData.teacherNumber : undefined,
        adminNumber: selectedRole === 'admin' ? formData.adminNumber : undefined,
        classId: selectedRole === 'student' ? formData.classId : undefined,
        parentId: selectedRole === 'student' ? formData.parentId : undefined,
      });

      navigate(ROUTES.ADMIN_USERS);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Gagal menambah user');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-users-create">
        <div className="page-header">
          <div>
            <h1>{getPageTitle()}</h1>
          </div>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="add-user-form">
            <FormInput
              label="Nama Lengkap"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />

            {selectedRole === 'student' && (
              <FormInput
                label="Nomor Induk Siswa (NIS)"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                placeholder="Masukkan NIS"
                required
              />
            )}

            {selectedRole === 'teacher' && (
              <FormInput
                label="Nomor Induk Pengajar (NIP)"
                value={formData.teacherNumber}
                onChange={(e) => setFormData({ ...formData, teacherNumber: e.target.value })}
                placeholder="Masukkan NIP"
                required
              />
            )}

            {selectedRole === 'admin' && (
              <FormInput
                label="Nomor Induk Admin"
                value={formData.adminNumber}
                onChange={(e) => setFormData({ ...formData, adminNumber: e.target.value })}
                placeholder="Masukkan Nomor Induk Admin"
                required
              />
            )}

            {selectedRole !== 'parent' && (
              <FormSelect
                label="Tingkat Sekolah"
                value={formData.schoolLevel}
                onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                options={[
                  { value: '', label: 'Pilih tingkat' },
                  { value: 'sd', label: 'SD' },
                  { value: 'smp', label: 'SMP' },
                  { value: 'sma', label: 'SMA' },
                ]}
                required
              />
            )}

            {selectedRole === 'student' && (
              <>
                <FormSelect
                  label="Kelas"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  options={[
                    { value: '', label: 'Pilih kelas' },
                    ...classes,
                  ]}
                  required
                />
                <FormSelect
                  label="Orang Tua"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  options={[
                    { value: '', label: 'Pilih orang tua' },
                    ...parents,
                  ]}
                />
              </>
            )}

            <FormInput
              label="No. HP"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />

            <div className="form-row">
              <FormInput
                label="Tempat Lahir"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="Masukkan tempat lahir"
              />
              <FormInput
                label="Tanggal Lahir"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Alamat</h4>
              <FormSelect
                label="Provinsi"
                value={formData.province}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    province: e.target.value,
                    city: '',
                    district: '',
                    village: '',
                  });
                }}
                options={[
                  { value: '', label: 'Pilih provinsi' },
                  ...PROVINCES,
                ]}
              />
              
              {formData.province && (
                <FormSelect
                  label="Kota/Kabupaten"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      city: e.target.value,
                      district: '',
                      village: '',
                    });
                  }}
                  options={[
                    { value: '', label: 'Pilih kota/kabupaten' },
                    ...(CITIES[formData.province] || []),
                  ]}
                />
              )}

              {formData.city && (
                <FormSelect
                  label="Kecamatan"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      district: e.target.value,
                      village: '',
                    });
                  }}
                  options={[
                    { value: '', label: 'Pilih kecamatan' },
                    ...(DISTRICTS[formData.city] || []),
                  ]}
                />
              )}

              {formData.district && (
                <FormSelect
                  label="Desa/Kelurahan"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  options={[
                    { value: '', label: 'Pilih desa/kelurahan' },
                    ...(VILLAGES[formData.district] || []),
                  ]}
                />
              )}

              <FormTextarea
                label="Alamat Lengkap"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="Masukkan alamat lengkap (jalan, nomor rumah, RT/RW, dll)"
                rows={3}
              />
            </div>

            <div className="form-file-uploads">
              <div className="file-upload-wrapper">
                <FileUpload
                  label="Upload Pas Foto"
                  accept=".jpg,.jpeg,.png"
                  maxSize={2}
                  onFileSelect={(files) => {
                    if (files.length > 0) {
                      setFormData({ ...formData, photoFile: files[0] });
                    }
                  }}
                  multiple={false}
                />
                {formData.photoFile && (
                  <div className="file-selected">
                    <Icon name="image" size={16} />
                    <span>{formData.photoFile.name}</span>
                    <span className="file-size">
                      ({(formData.photoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    {photoPreviewUrl && (
                      <div className="photo-preview">
                        <img
                          src={photoPreviewUrl}
                          alt="Preview pas foto"
                          className="photo-preview-img"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoFile: null })}
                      className="file-remove"
                      aria-label="Hapus file"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="file-upload-wrapper">
                <FileUpload
                  label="Upload KK (Kartu Keluarga)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  onFileSelect={(files) => {
                    if (files.length > 0) {
                      setFormData({ ...formData, kkFile: files[0] });
                    }
                  }}
                  multiple={false}
                />
                {formData.kkFile && (
                  <div className="file-selected">
                    <Icon name="attachment" size={16} />
                    <span>{formData.kkFile.name}</span>
                    <span className="file-size">
                      ({(formData.kkFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, kkFile: null })}
                      className="file-remove"
                      aria-label="Hapus file"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="file-upload-wrapper">
                <FileUpload
                  label="Upload KTP"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  onFileSelect={(files) => {
                    if (files.length > 0) {
                      setFormData({ ...formData, ktpFile: files[0] });
                    }
                  }}
                  multiple={false}
                />
                {formData.ktpFile && (
                  <div className="file-selected">
                    <Icon name="attachment" size={16} />
                    <span>{formData.ktpFile.name}</span>
                    <span className="file-size">
                      ({(formData.ktpFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ktpFile: null })}
                      className="file-remove"
                      aria-label="Hapus file"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.ADMIN_USERS)}
                disabled={isCreating}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Simpan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

