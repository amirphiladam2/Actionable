//signupLogic.jsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

 const useSignUpLogic = () => {
  const [loading, setLoading] = useState(false);
  
  // Initial signup form state
  const initialSignupState = {
    name: '',
    signupEmail: '',
    signupPassword: '',
    terms: false
  };

  // Validation functions
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Validate signup form
  const validateSignupForm = (formData) => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.signupEmail) {
      newErrors.signupEmail = 'Email is required';
    } else if (!validateEmail(formData.signupEmail)) {
      newErrors.signupEmail = 'Please enter a valid email';
    }
    
    if (!formData.signupPassword) {
      newErrors.signupPassword = 'Password is required';
    } else if (!validatePassword(formData.signupPassword)) {
      newErrors.signupPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'Please accept the terms and privacy policy';
    }
    
    return newErrors;
  };

  // Handle signup submission
 const handleSignup = async (formData) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name
        }
      }
    });
    
    if (error) {
      Alert.alert(error.message);
      return { success: false, error };
    }
    
    Alert.alert('Success!', 'Please check your email and click the verification link to complete your account setup.');
    return { success: true };
  } catch (error) {
    Alert.alert('An unexpected error occurred');
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};
  // Return all necessary state and functions
  return {
    loading,
    initialSignupState,
    validateSignupForm,
    handleSignup
  };
};
export default useSignUpLogic;

