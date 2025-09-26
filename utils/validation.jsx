// utils/validation.js
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) return { isValid: false, error: 'Email is required' };
    if (!EMAIL_REGEX.test(trimmedEmail)) return { isValid: false, error: 'Please enter a valid email address' };
    return { isValid: true, error: null };
  },

  // Password validation
  validatePassword: (password) => {
    if (!password) return { isValid: false, error: 'Password is required' };
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }
    return { isValid: true, error: null };
  },

  // Sign-in form validation
  validateSigninForm: (formData) => {
    const errors = {};
    const emailValidation = ValidationUtils.validateEmail(formData?.email);
    const passwordValidation = ValidationUtils.validatePassword(formData?.password);

    if (!emailValidation.isValid) errors.email = emailValidation.error;
    if (!passwordValidation.isValid) errors.password = passwordValidation.error;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Sign-up form validation
  validateSignupForm: (formData) => {
    const errors = {};
    const emailValidation = ValidationUtils.validateEmail(formData?.email);
    const passwordValidation = ValidationUtils.validatePassword(formData?.password);

    if (!emailValidation.isValid) errors.email = emailValidation.error;
    if (!passwordValidation.isValid) errors.password = passwordValidation.error;

    if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) errors.lastName = 'Last name is required';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Phone number validation (optional)
  validatePhoneNumber: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    const trimmedPhone = phone?.trim();
    
    if (!trimmedPhone) return { isValid: true, error: null }; // Optional field
    if (!phoneRegex.test(trimmedPhone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true, error: null };
  },

  // Clean and format input
  sanitizeInput: (input) => {
    return input?.trim().replace(/\s+/g, ' ') || '';
  },

  // Name validation
  validateName: (name, fieldName = 'Name') => {
    const trimmedName = name?.trim();
    if (!trimmedName) return { isValid: false, error: `${fieldName} is required` };
    if (trimmedName.length < 2) return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    }
    return { isValid: true, error: null };
  }
};