import { apiClient } from './api';
// @ts-ignore - xlsx types may not be perfect
import * as XLSX from 'xlsx';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ExcelImportResult {
  success: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}

export const excelService = {
  /**
   * Parse Excel file and return JSON data
   */
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '',
            raw: false 
          });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsBinaryString(file);
    });
  },

  /**
   * Generate Excel template file for users import
   */
  generateUsersTemplate(role: 'student' | 'teacher' | 'admin' | 'parent'): void {
    const headers: string[] = [];
    const exampleRow: any = {};

    if (role === 'student') {
      headers.push('NIS', 'Username', 'Password', 'Nama Lengkap', 'Email', 'Tingkat Sekolah', 'Kelas ID', 'No. HP', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat');
      exampleRow['NIS'] = '2024001';
      exampleRow['Username'] = 'siswa001';
      exampleRow['Password'] = 'password123';
      exampleRow['Nama Lengkap'] = 'Budi Santoso';
      exampleRow['Email'] = 'budi@example.com';
      exampleRow['Tingkat Sekolah'] = 'sma';
      exampleRow['Kelas ID'] = 'class1';
      exampleRow['No. HP'] = '081234567890';
      exampleRow['Tempat Lahir'] = 'Jakarta';
      exampleRow['Tanggal Lahir'] = '2005-05-15';
      exampleRow['Alamat'] = 'Jl. Contoh No. 123';
    } else if (role === 'teacher') {
      headers.push('NIP', 'Username', 'Password', 'Nama Lengkap', 'Email', 'Tingkat Sekolah', 'No. HP', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat');
      exampleRow['NIP'] = '1985001';
      exampleRow['Username'] = 'guru001';
      exampleRow['Password'] = 'password123';
      exampleRow['Nama Lengkap'] = 'Ibu Siti';
      exampleRow['Email'] = 'siti@example.com';
      exampleRow['Tingkat Sekolah'] = 'sma';
      exampleRow['No. HP'] = '081234567891';
      exampleRow['Tempat Lahir'] = 'Bandung';
      exampleRow['Tanggal Lahir'] = '1985-03-20';
      exampleRow['Alamat'] = 'Jl. Contoh No. 456';
    } else if (role === 'admin') {
      headers.push('NIP Admin', 'Username', 'Password', 'Nama Lengkap', 'Email', 'Tingkat Sekolah', 'No. HP', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat');
      exampleRow['NIP Admin'] = 'ADM001';
      exampleRow['Username'] = 'admin001';
      exampleRow['Password'] = 'password123';
      exampleRow['Nama Lengkap'] = 'Admin Sekolah';
      exampleRow['Email'] = 'admin@example.com';
      exampleRow['Tingkat Sekolah'] = 'sma';
      exampleRow['No. HP'] = '081234567892';
      exampleRow['Tempat Lahir'] = 'Surabaya';
      exampleRow['Tanggal Lahir'] = '1980-01-10';
      exampleRow['Alamat'] = 'Jl. Contoh No. 789';
    } else {
      headers.push('Username', 'Password', 'Nama Lengkap', 'Email', 'No. HP', 'Alamat');
      exampleRow['Username'] = 'ortu001';
      exampleRow['Password'] = 'password123';
      exampleRow['Nama Lengkap'] = 'Bapak Santoso';
      exampleRow['Email'] = 'ortu@example.com';
      exampleRow['No. HP'] = '081234567893';
      exampleRow['Alamat'] = 'Jl. Contoh No. 321';
    }

    // Create worksheet with headers and example row
    const data = [headers, Object.values(exampleRow)];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths for better readability
    const colWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Template_Import_${role}_${dateStr}.xlsx`;
    
    // Download the file
    XLSX.writeFile(workbook, filename);
  },

  /**
   * Import users from Excel file via API
   */
  async importUsers(file: File, role: string): Promise<ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);

    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${API_BASE_URL}/excel/import-users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json() as ApiResponse<ExcelImportResult>;

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to import users');
    }

    return data.data!;
  },

  /**
   * Download example Excel file
   */
  downloadExample(role: 'student' | 'teacher' | 'admin' | 'parent'): void {
    this.generateUsersTemplate(role);
  },
};
