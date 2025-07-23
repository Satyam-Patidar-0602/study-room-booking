// URL Configuration for different environments
const getBaseUrl = () => {
  // Use VITE_API_URL if set (for production), otherwise default to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const getUploadUrl = (filename) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/${filename}`;
};

const getFallbackUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/fallback.pdf`;
};

export { getBaseUrl, getUploadUrl, getFallbackUrl }; 