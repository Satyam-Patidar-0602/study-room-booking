// URL Configuration for different environments
const getBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // For production, use your actual domain
  // Update this when you deploy
  return 'https://yourdomain.com'; // Replace with your actual domain
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