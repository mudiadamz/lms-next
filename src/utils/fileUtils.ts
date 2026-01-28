/**
 * Get full URL for file downloads
 * Converts relative paths to full URLs pointing to API server
 */
export const getFileUrl = (path: string): string => {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get API base URL without /api suffix
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const serverUrl = apiBaseUrl.replace('/api', '');
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${serverUrl}${normalizedPath}`;
};

/**
 * Get file name from URL or path
 */
export const getFileName = (path: string): string => {
  if (!path) return 'file';
  return path.split('/').pop() || 'file';
};
