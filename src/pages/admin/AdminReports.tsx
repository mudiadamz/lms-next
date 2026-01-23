import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormSelect, Modal, Icon, Badge, FormInput, Loading } from '../../components/common';
import { SCHOOL_LEVELS } from '../../constants';
import { classService, academicYearService } from '../../services';
import './AdminReports.css';

const REPORT_TYPES = [
  {
    id: 'attendance',
    title: 'Laporan Absensi',
    description: 'Laporan kehadiran siswa per kelas, per mata pelajaran, atau per periode',
    icon: 'userGroup',
    color: 'primary',
  },
  {
    id: 'grades',
    title: 'Laporan Nilai',
    description: 'Laporan nilai siswa, per kelas, per mata pelajaran, atau rapor',
    icon: 'grade',
    color: 'success',
  },
  {
    id: 'students',
    title: 'Laporan Data Siswa',
    description: 'Laporan data siswa per kelas, per tingkat, atau keseluruhan',
    icon: 'users',
    color: 'info',
  },
  {
    id: 'teachers',
    title: 'Laporan Data Guru',
    description: 'Laporan data guru, mata pelajaran yang diampu, dan kelas yang diajar',
    icon: 'user',
    color: 'warning',
  },
  {
    id: 'classes',
    title: 'Laporan Data Kelas',
    description: 'Laporan data kelas, jumlah siswa, wali kelas, dan mata pelajaran',
    icon: 'book',
    color: 'secondary',
  },
  {
    id: 'subjects',
    title: 'Laporan Mata Pelajaran',
    description: 'Laporan mata pelajaran, guru pengampu, dan kelas yang menggunakan',
    icon: 'document',
    color: 'primary',
  },
];

export const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    reportType: '',
    classId: 'all',
    academicYear: '',
    semester: '1',
    schoolLevel: '',
    startDate: '',
    endDate: '',
    format: 'pdf',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, academicYearsData] = await Promise.all([
          classService.getClasses(),
          academicYearService.getAcademicYears(),
        ]);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setAcademicYears(academicYearsData.map(ay => ({ value: ay.name, label: ay.name })));
        
        if (academicYearsData.length > 0) {
          setFormData(prev => ({ ...prev, academicYear: academicYearsData[0].name }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGenerate = (reportId: string) => {
    setSelectedReport(reportId);
    const defaultYear = academicYears.length > 0 ? academicYears[0].value : formData.academicYear || '';
    setFormData({
      reportType: reportId,
      classId: 'all',
      academicYear: defaultYear,
      semester: '1',
      schoolLevel: '',
      startDate: '',
      endDate: '',
      format: 'pdf',
    });
    setShowGenerateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Note: Report generation would typically call a backend API
      // For now, we'll just show a success message
      // In a real implementation, this would download the report file
      alert(`Laporan berhasil dibuat! Format: ${formData.format.toUpperCase()}`);
      setShowGenerateModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal membuat laporan');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportFormFields = () => {
    const reportType = REPORT_TYPES.find((r) => r.id === formData.reportType);
    if (!reportType) return null;

    switch (reportType.id) {
      case 'attendance':
        return (
          <>
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={classes}
            />
            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={academicYears}
            />
            <FormSelect
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: 'all', label: 'Semua Semester' },
              ]}
            />
            <div className="form-row">
              <FormInput
                label="Tanggal Mulai (Opsional)"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <FormInput
                label="Tanggal Selesai (Opsional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </>
        );

      case 'grades':
        return (
          <>
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={[
                { value: 'all', label: 'Semua Kelas' },
                ...classes,
              ]}
            />
            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={[
                { value: '', label: 'Pilih tahun ajaran' },
                ...academicYears,
              ]}
            />
            <FormSelect
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: 'all', label: 'Semua Semester' },
              ]}
            />
          </>
        );

      case 'students':
      case 'teachers':
      case 'classes':
        return (
          <>
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: '', label: 'Semua Tingkat' },
                ...Object.entries(SCHOOL_LEVELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
            {formData.reportType === 'students' && (
              <FormSelect
                label="Kelas"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { value: 'all', label: 'Semua Kelas' },
                  ...classes,
                ]}
              />
            )}
          </>
        );

      case 'subjects':
        return (
          <>
            <FormSelect
              label="Tingkat Sekolah"
              value={formData.schoolLevel}
              onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
              options={[
                { value: '', label: 'Semua Tingkat' },
                ...Object.entries(SCHOOL_LEVELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={[
                { value: '', label: 'Pilih tahun ajaran' },
                ...academicYears,
              ]}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-reports">
        <div className="page-header">
          <h1>Laporan Sekolah</h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="reports-grid">
          {REPORT_TYPES.map((report) => (
            <Card key={report.id} variant="elevated" className="report-card">
              <div className="report-card-header">
                <div className="report-icon">
                  <Icon name={report.icon as any} size={32} />
                </div>
                <Badge variant={report.color as any} style={{ marginLeft: 'auto' }}>
                  {report.title.split(' ')[0]}
                </Badge>
              </div>
              <h3 className="report-title">{report.title}</h3>
              <p className="report-description">{report.description}</p>
              <Button
                onClick={() => handleGenerate(report.id)}
                variant="primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <Icon name="download" size={16} style={{ marginRight: '0.5rem' }} />
                Generate Laporan
              </Button>
            </Card>
          ))}
          </div>
        )}

        {/* Generate Report Modal */}
        <Modal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedReport(null);
          }}
          title={`Generate ${REPORT_TYPES.find((r) => r.id === selectedReport)?.title || 'Laporan'}`}
          size="medium"
        >
          <form onSubmit={handleSubmit} className="report-form">
            {getReportFormFields()}
            <FormSelect
              label="Format Laporan"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'excel', label: 'Excel (.xlsx)' },
                { value: 'csv', label: 'CSV' },
              ]}
            />
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isGenerating}>
                <Icon name="download" size={16} style={{ marginRight: '0.5rem' }} />
                Generate & Download
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
