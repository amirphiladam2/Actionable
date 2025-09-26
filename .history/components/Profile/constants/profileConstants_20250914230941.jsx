export const PROFILE_CONSTANTS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BIO_LENGTH: 500,
  MAX_USERNAME_LENGTH: 30,
  MAX_NAME_LENGTH: 100,
  
  IMAGE_QUALITY: 0.8,
  IMAGE_ASPECT_RATIO: [1, 1],
  
  UPLOAD_RETRY_ATTEMPTS: 3,
  UPLOAD_RETRY_DELAY: 1000,
  
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  CACHE_CONTROL: '3600'
};

export const ERROR_MESSAGES = {
  AUTHENTICATION: 'Please sign in to continue',
  NETWORK: 'Network error. Please check your connection and try again.',
  IMAGE_TOO_LARGE: 'Image is too large. Please select an image smaller than 5MB.',
  IMAGE_INVALID: 'Invalid image format. Please select a JPEG, PNG, or WebP image.',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  GENERIC: 'An error occurred. Please try again.'
};