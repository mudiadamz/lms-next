import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FileUpload, Icon, FormTextarea, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { classService, userService, subjectService } from '../../services';
import './AdminUsers.css';

export const AdminUsersCreate = () => {
  const navigate = useNavigate();
  const { role, id } = useParams<{ role?: string; id?: string }>();
  const [selectedRole, setSelectedRole] = useState(role || 'admin');
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [classesRaw, setClassesRaw] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    teacherNumber: '',
    adminNumber: '',
    schoolLevel: '',
    phoneNumber: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
    fullAddress: '',
    classId: '',
    parentId: '',
    kkFile: null as File | null,
    ktpFile: null as File | null,
    photoFile: null as File | null,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [homeroomClassId, setHomeroomClassId] = useState('');
  const [teachingClassIds, setTeachingClassIds] = useState<string[]>([]);
  const [teachingSubjectIds, setTeachingSubjectIds] = useState<string[]>([]);
  const [hasLoadedTeacherAssignments, setHasLoadedTeacherAssignments] = useState(!id);
  const [createParent, setCreateParent] = useState(true);
  const [parentData, setParentData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    if (!id) {
      setSelectedRole(role || 'admin');
    }
  }, [role, id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);
        setClassesRaw(classesData);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setSubjects(
          subjectsData.map((subject) => ({
            value: subject.id,
            label: `${subject.name}${subject.code ? ` (${subject.code})` : ''}`,
          }))
        );
        if (id) {
          const user = await userService.getUserById(id);
          setSelectedRole(user.role || 'admin');
          const homeroomClass = classesData.find((cls: any) => cls.homeroomTeacherId === user.id);
          setHomeroomClassId(homeroomClass?.id || '');
          if (user.role === 'teacher') {
            setHasLoadedTeacherAssignments(false);
            try {
              const teacherSubjects = await subjectService.getSubjects(undefined, user.id);
              setTeachingSubjectIds(teacherSubjects.map((subject) => subject.id));
              const classIds = new Set<string>();
              teacherSubjects.forEach((subject) => {
                (subject.classIds || []).forEach((classId: string) => classIds.add(classId));
              });
              setTeachingClassIds(Array.from(classIds));
            } finally {
              setHasLoadedTeacherAssignments(true);
            }
          }
          setFormData((prev) => ({
            ...prev,
            fullName: user.fullName || '',
            studentNumber: user.studentNumber || '',
            teacherNumber: user.teacherNumber || '',
            adminNumber: user.adminNumber || '',
            schoolLevel: user.schoolLevel || '',
            phoneNumber: user.phoneNumber || '',
            gender: user.gender || '',
            birthPlace: user.birthPlace || '',
            birthDate: user.birthDate ? toDateInputValue(user.birthDate) : '',
            fullAddress: user.address || '',
            classId: user.classId || '',
            parentId: user.studentId || '',
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

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
        return isEditMode ? 'Edit Murid' : 'Tambah Murid';
      case 'teacher':
        return isEditMode ? 'Edit Guru' : 'Tambah Guru';
      case 'admin':
        return isEditMode ? 'Edit Admin' : 'Tambah Admin';
      default:
        return isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna';
    }
  };

  const toDateInputValue = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setIsSaved(false);

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

      const address = formData.fullAddress || undefined;
      const password = numberInduk || 'password';
      const username = numberInduk || formData.fullName.toLowerCase().trim().replace(/\s+/g, '.');

      const updateTeacherAssignments = async (teacherId: string) => {
        if (selectedRole !== 'teacher') return;
        if (isEditMode && !hasLoadedTeacherAssignments) return;
        const subjectsData = await subjectService.getSubjects(undefined, teacherId);
        const subjectsToRemove = subjectsData.filter((subject) => !teachingSubjectIds.includes(subject.id));
        await Promise.all([
          ...subjectsToRemove.map((subject) => subjectService.updateSubject(subject.id, { teacherId: null })),
          ...teachingSubjectIds.map((subjectId) =>
            subjectService.updateSubject(subjectId, {
              teacherId,
              classIds: teachingClassIds,
            })
          ),
        ]);
      };

      if (isEditMode && id) {
        const updatedTeacher = await userService.updateUser(id, {
          username: numberInduk ? numberInduk : undefined,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          address: address || undefined,
          gender: formData.gender || undefined,
          birthPlace: formData.birthPlace || undefined,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
          schoolLevel: selectedRole === 'teacher' || selectedRole === 'admin'
            ? undefined
            : (formData.schoolLevel ? (formData.schoolLevel as 'sd' | 'smp' | 'sma') : undefined),
          studentNumber: selectedRole === 'student' ? (formData.studentNumber || undefined) : undefined,
          teacherNumber: selectedRole === 'teacher' ? (formData.teacherNumber || undefined) : undefined,
          adminNumber: selectedRole === 'admin' ? (formData.adminNumber || undefined) : undefined,
          classId: selectedRole === 'student' ? (formData.classId || undefined) : undefined,
          studentId: selectedRole === 'student' ? (formData.parentId || undefined) : undefined,
        });
        if (selectedRole === 'teacher') {
          const teacherId = updatedTeacher.id;
          const previousHomerooms = classesRaw.filter(
            (cls: any) => cls.homeroomTeacherId === teacherId && cls.id !== homeroomClassId
          );
          await Promise.all(
            previousHomerooms.map((cls: any) =>
              classService.updateClass(cls.id, { homeroomTeacherId: null } as any)
            )
          );
          if (homeroomClassId) {
            await classService.updateClass(homeroomClassId, { homeroomTeacherId: teacherId } as any);
          }
          await updateTeacherAssignments(teacherId);
        }
      } else {
        const createdUser = await userService.createUser({
          username,
          fullName: formData.fullName,
          email: formData.fullName.toLowerCase().replace(/\s+/g, '.') + '@school.com', // Generate email
          password,
          role: selectedRole as 'student' | 'teacher' | 'admin' | 'parent',
          phoneNumber: formData.phoneNumber || undefined,
          gender: formData.gender || undefined,
          address: address,
          birthPlace: formData.birthPlace || undefined,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
          schoolLevel: selectedRole === 'teacher' || selectedRole === 'admin'
            ? undefined
            : (formData.schoolLevel ? (formData.schoolLevel as 'sd' | 'smp' | 'sma') : undefined),
          studentNumber: selectedRole === 'student' ? formData.studentNumber : undefined,
          teacherNumber: selectedRole === 'teacher' ? formData.teacherNumber : undefined,
          adminNumber: selectedRole === 'admin' ? formData.adminNumber : undefined,
          classId: selectedRole === 'student' ? formData.classId : undefined,
        });
        if (selectedRole === 'teacher') {
          const teacherId = createdUser.id;
          if (homeroomClassId) {
            await classService.updateClass(homeroomClassId, { homeroomTeacherId: teacherId } as any);
          }
          await updateTeacherAssignments(teacherId);
        }

        if (selectedRole === 'student' && createParent) {
          const parentName = parentData.fullName || `Orang Tua ${formData.fullName}`;
          const parentUsername = numberInduk
            ? `${numberInduk}-ortu`
            : `${formData.fullName.toLowerCase().trim().replace(/\s+/g, '.')}.ortu`;
          try {
            await userService.createUser({
              username: parentUsername,
              fullName: parentName,
              email: parentData.email || `${parentUsername}@school.com`,
              password: 'password',
              role: 'parent',
              phoneNumber: parentData.phoneNumber || undefined,
              address: address,
              studentId: createdUser.id,
            });
          } catch (error) {
            console.error('Error creating parent user:', error);
            alert('Murid berhasil dibuat, tetapi gagal membuat akun orang tua.');
          }
        }
      }

      navigate(`${ROUTES.ADMIN_USERS}?role=${selectedRole}`);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      alert(isEditMode ? 'Gagal memperbarui user' : 'Gagal menambah user');
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

            {selectedRole === 'teacher' && (
              <>
                <FormSelect
                  label="Wali Kelas"
                  value={homeroomClassId}
                  onChange={(e) => setHomeroomClassId(e.target.value)}
                  options={[
                    { value: '', label: 'Pilih wali kelas (opsional)' },
                    ...classes.map((cls) => ({
                      value: cls.value,
                      label: cls.label,
                    })),
                  ]}
                />
                <div className="checkbox-group">
                  <label className="checkbox-group-label">Kelas yang Diajar</label>
                  {classes.length === 0 ? (
                    <div className="checkbox-empty">Tidak ada kelas tersedia</div>
                  ) : (
                    <div className="checkbox-grid">
                      {classes.map((cls) => (
                        <label key={cls.value} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={teachingClassIds.includes(cls.value)}
                            onChange={(e) => {
                              setTeachingClassIds((prev) =>
                                e.target.checked
                                  ? [...prev, cls.value]
                                  : prev.filter((id) => id !== cls.value),
                              );
                            }}
                          />
                          <span>{cls.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="checkbox-group">
                  <label className="checkbox-group-label">Mata Pelajaran yang Diajar</label>
                  {subjects.length === 0 ? (
                    <div className="checkbox-empty">Tidak ada mata pelajaran tersedia</div>
                  ) : (
                    <div className="checkbox-grid">
                      {subjects.map((subject) => (
                        <label key={subject.value} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={teachingSubjectIds.includes(subject.value)}
                            onChange={(e) => {
                              setTeachingSubjectIds((prev) =>
                                e.target.checked
                                  ? [...prev, subject.value]
                                  : prev.filter((id) => id !== subject.value),
                              );
                            }}
                          />
                          <span>{subject.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
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

            {selectedRole !== 'parent' && selectedRole !== 'teacher' && selectedRole !== 'admin' && (
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
              </>
            )}

            <FormInput
              label="No. HP"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />

            <FormSelect
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: '', label: 'Pilih jenis kelamin' },
                { value: 'male', label: 'Laki-laki' },
                { value: 'female', label: 'Perempuan' },
              ]}
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
              <FormTextarea
                label="Alamat Lengkap"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="Masukkan alamat lengkap (jalan, nomor rumah, RT/RW, dll)"
                rows={3}
              />
            </div>

            {selectedRole === 'student' && (
              <div className="form-section">
                <h4 className="form-section-title">Wali Murid</h4>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={createParent}
                    onChange={(e) => setCreateParent(e.target.checked)}
                  />
                  Buat akun wali murid otomatis
                </label>
                {createParent && (
                  <>
                    <FormInput
                      label="Nama Wali Murid"
                      value={parentData.fullName}
                      onChange={(e) => setParentData({ ...parentData, fullName: e.target.value })}
                      placeholder="Masukkan nama wali murid"
                    />
                    <FormInput
                      label="No. HP Wali Murid"
                      type="tel"
                      value={parentData.phoneNumber}
                      onChange={(e) => setParentData({ ...parentData, phoneNumber: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                    />
                    <FormInput
                      label="Email Wali Murid"
                      type="email"
                      value={parentData.email}
                      onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                      placeholder="walimurid@example.com"
                    />
                    <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#6b7280' }}>
                      Username wali murid dibuat otomatis dari NIS (contoh: 12345-ortu).
                    </p>
                  </>
                )}
              </div>
            )}

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
              {isSaved && (
                <div className="settings-saved-message" style={{ marginRight: 'auto' }}>
                  ✓ Data berhasil disimpan
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const targetRole = (selectedRole || role || 'admin').toLowerCase();
                  navigate(`${ROUTES.ADMIN_USERS}?role=${targetRole}`);
                }}
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

