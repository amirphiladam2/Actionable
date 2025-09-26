import { useState, useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { ValidationUtils } from '../utils/validation';
import { ToastUtils } from '../utils/toast';

// Constants
const INITIAL_SIGNIN_STATE = {
  email: '',
  password: ''
};

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'supabase_access_token',
  REFRESH_TOKEN: 'supabase_refresh_token',
  USER_SESSION: 'supabase_user_session'
};

const ERROR_MESSAGES = {
  SIGNIN_FAILED: 'Sign In Failed',
  GOOGLE_SIGNIN_FAILED: 'Google Sign In Failed',
  RESET_PASSWORD_FAILED: 'Password Reset Failed',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  EMAIL_REQUIRED_RESET: 'Please enter your email address to reset password',
  PASSWORD_RESET_SUCCESS: 'Check your email for password reset instructions',
  TOKEN_STORAGE_FAILED: 'Failed to secure your session. Please try signing in again.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  MULTIPLE_REQUESTS: 'Please wait for the current request to complete'
};

const SUCCESS_MESSAGES = {
  SIGNIN_SUCCESS: 'Welcome back!',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  SIGNOUT_SUCCESS: 'Signed out successfully'
};

const ROUTES = {
  HOME: '/(tabs)/home',
  SIGNIN: '/signin'
};

const DEEP_LINKS = {
  AUTH_CALLBACK: 'actionable://auth/callback',
  RESET_PASSWORD: 'actionable://auth/reset-password'
};

// Secure token storage utilities
const secureTokenStorage = {
  async storeTokens(session) {
    try {
      const options = {
        requireAuthentication: true,
        authenticationPrompt: 'Authenticate to save your session securely',
        authenticationType: SecureStore.AUTHENTICATION_TYPE.BIOMETRIC_OR_DEVICE_PASSCODE,
      };

      const tasks = [];

      if (session?.access_token) {
        tasks.push(
          SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, session.access_token, options)
        );
      }

      if (session?.refresh_token) {
        tasks.push(
          SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, session.refresh_token, options)
        );
      }

      const sessionInfo = {
        expires_at: session?.expires_at,
        expires_in: session?.expires_in,
        user_id: session?.user?.id,
        email: session?.user?.email,
        created_at: Date.now()
      };

      tasks.push(
        SecureStore.setItemAsync(
          SECURE_STORE_KEYS.USER_SESSION,
          JSON.stringify(sessionInfo),
          options
        )
      );

      await Promise.all(tasks);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getTokens() {
    try {
      const options = {
        requireAuthentication: true,
        authenticationPrompt: 'Authenticate to access your session',
        authenticationType: SecureStore.AUTHENTICATION_TYPE.BIOMETRIC_OR_DEVICE_PASSCODE,
      };

      const [accessToken, refreshToken, sessionInfo] = await Promise.all([
        SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, options),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, options),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_SESSION, options)
      ]);

      if (!accessToken || !refreshToken) {
        return { success: false, error: new Error('No stored tokens found') };
      }

      const parsedSessionInfo = sessionInfo ? JSON.parse(sessionInfo) : null;

      return {
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          session_info: parsedSessionInfo
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  async clearTokens() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_SESSION).catch(() => {})
      ]);
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  isSessionExpired(sessionInfo) {
    if (!sessionInfo?.expires_at) return true;
    
    const expiryTime = new Date(sessionInfo.expires_at).getTime();
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime >= (expiryTime - bufferTime);
  }
};

const useSignInLogic = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const navigationGuardRef = useRef(false);

  // Prevent multiple simultaneous requests
  const requestInProgress = useRef(false);

  // Check for existing session on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const storeResult = await secureTokenStorage.storeTokens(session);
          if (!storeResult.success) {
            ToastUtils.error('Security Warning', ERROR_MESSAGES.TOKEN_STORAGE_FAILED);
          }
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          await secureTokenStorage.clearTokens();
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await secureTokenStorage.storeTokens(session);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // First check if there's an active session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        await secureTokenStorage.clearTokens();
        setIsAuthenticated(false);
        return;
      }

      if (session) {
        // Valid session exists
        setIsAuthenticated(true);
        return;
      }

      // No active session, check stored tokens
      const tokenResult = await secureTokenStorage.getTokens();
      
      if (!tokenResult.success) {
        setIsAuthenticated(false);
        return;
      }

      const { session_info, refresh_token } = tokenResult.data;
      
      // Check if stored session is expired
      if (secureTokenStorage.isSessionExpired(session_info)) {
        // Attempt to refresh token
        await handleTokenRefresh(refresh_token);
      } else {
        // Restore session
        await restoreSession(tokenResult.data);
      }
    } catch (error) {
      await secureTokenStorage.clearTokens();
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Restore session from stored tokens
  const restoreSession = useCallback(async (tokenData) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      });

      if (error || !data.session) {
        throw error || new Error('Failed to restore session');
      }

      setIsAuthenticated(true);
    } catch (error) {
      await secureTokenStorage.clearTokens();
      setIsAuthenticated(false);
    }
  }, []);

  // Handle token refresh
  const handleTokenRefresh = useCallback(async (refreshToken = null) => {
    try {
      let tokenToUse = refreshToken;
      
      if (!tokenToUse) {
        const tokenResult = await secureTokenStorage.getTokens();
        if (!tokenResult.success) throw new Error('No refresh token available');
        tokenToUse = tokenResult.data.refresh_token;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: tokenToUse
      });

      if (error || !data.session) {
        throw error || new Error('Token refresh failed');
      }

      await secureTokenStorage.storeTokens(data.session);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      await secureTokenStorage.clearTokens();
      setIsAuthenticated(false);
      ToastUtils.error('Session Expired', ERROR_MESSAGES.SESSION_EXPIRED);
      
      if (!navigationGuardRef.current) {
        navigationGuardRef.current = true;
        router.replace(ROUTES.SIGNIN);
        setTimeout(() => { navigationGuardRef.current = false; }, 1000);
      }
      
      return { success: false, error };
    }
  }, [router]);

  // Navigation guard helper
  const navigateWithGuard = useCallback((route) => {
    if (!navigationGuardRef.current) {
      navigationGuardRef.current = true;
      router.replace(route);
      setTimeout(() => { navigationGuardRef.current = false; }, 1000);
    }
  }, [router]);

  // Request guard helper
  const withRequestGuard = useCallback(async (asyncFn) => {
    if (requestInProgress.current) {
      ToastUtils.warning('Please wait', ERROR_MESSAGES.MULTIPLE_REQUESTS);
      return { success: false, error: new Error('Request in progress') };
    }

    requestInProgress.current = true;
    setLoading(true);

    try {
      const result = await asyncFn();
      return result;
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, []);

  // Email sign in
  const handleEmailSignin = useCallback(async (formData) => {
    return await withRequestGuard(async () => {
      const validation = ValidationUtils.validateSigninForm(formData);
      
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        ToastUtils.error('Invalid Input', firstError);
        return { success: false, error: new Error('Validation failed'), errors: validation.errors };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });
        
        if (error) {
          ToastUtils.error(ERROR_MESSAGES.SIGNIN_FAILED, error.message);
          return { success: false, error };
        }
        
        ToastUtils.success(SUCCESS_MESSAGES.SIGNIN_SUCCESS);
        navigateWithGuard(ROUTES.HOME);
        
        return { success: true, data };
        
      } catch (error) {
        ToastUtils.error('Sign In Error', ERROR_MESSAGES.UNEXPECTED_ERROR);
        return { success: false, error };
      }
    });
  }, [withRequestGuard, navigateWithGuard]);

  // Google OAuth sign in
  // Replace the handleGoogleSignIn function in your useSignInLogic hook with this simplified version:

const handleGoogleSignIn = useCallback(async () => {
  if (requestInProgress.current) {
    ToastUtils.warning('Please wait', ERROR_MESSAGES.MULTIPLE_REQUESTS);
    return { success: false, error: new Error('Request in progress') };
  }

  requestInProgress.current = true;
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: DEEP_LINKS.AUTH_CALLBACK,
      },
    });

    if (error) {
      ToastUtils.error(ERROR_MESSAGES.GOOGLE_SIGNIN_FAILED, error.message);
      return { success: false, error };
    }

    // Return the data with URL for the LoginScreen to handle
    return { success: true, data };
    
  } catch (error) {
    ToastUtils.error('Google Sign In Error', ERROR_MESSAGES.UNEXPECTED_ERROR);
    return { success: false, error };
  } finally {
    requestInProgress.current = false;
    setLoading(false);
  }
}, []);

// Also update your LoginScreen's handleGoogleSignIn to be simpler:
const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGoogle();

    if (result.error) {
      Alert.alert('Google Sign-In Failed', result.error.message);
      return;
    }

    if (result.data?.url) {
      await WebBrowser.openAuthSessionAsync(result.data.url, 'caloriee://auth');
    }
  } catch (err) {
    Alert.alert('Error', 'Google sign-in failed. Please try again.');
    console.error('Google sign-in error:', err);
  }
};
  // Sign out
  const handleSignOut = useCallback(async () => {
    return await withRequestGuard(async () => {
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          ToastUtils.error('Sign Out Failed', error.message);
          return { success: false, error };
        }
        
        await secureTokenStorage.clearTokens();
        setIsAuthenticated(false);
        
        ToastUtils.success(SUCCESS_MESSAGES.SIGNOUT_SUCCESS);
        navigateWithGuard(ROUTES.SIGNIN);
        
        return { success: true };
        
      } catch (error) {
        ToastUtils.error('Sign Out Error', ERROR_MESSAGES.UNEXPECTED_ERROR);
        return { success: false, error };
      }
    });
  }, [withRequestGuard, navigateWithGuard]);

  // Password reset
  const handleForgotPassword = useCallback(async (email) => {
    return await withRequestGuard(async () => {
      const validation = ValidationUtils.validateEmail(email);
      
      if (!validation.isValid) {
        ToastUtils.error('Invalid Email', validation.error);
        return { success: false, error: new Error('Invalid email') };
      }
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: DEEP_LINKS.RESET_PASSWORD,
        });
        
        if (error) {
          ToastUtils.error(ERROR_MESSAGES.RESET_PASSWORD_FAILED, error.message);
          return { success: false, error };
        }
        
        ToastUtils.success(SUCCESS_MESSAGES.PASSWORD_RESET_SENT, ERROR_MESSAGES.PASSWORD_RESET_SUCCESS);
        return { success: true };
        
      } catch (error) {
        ToastUtils.error('Password Reset Error', ERROR_MESSAGES.UNEXPECTED_ERROR);
        return { success: false, error };
      }
    });
  }, [withRequestGuard]);

  // Public interface
  return {
    // State
    loading,
    isAuthenticated,
    isInitializing,
    
    // Form helpers
    initialSigninState: INITIAL_SIGNIN_STATE,
    validateEmail: ValidationUtils.validateEmail,
    validateSigninForm: ValidationUtils.validateSigninForm,
    
    // Actions
    handleEmailSignin,
    handleGoogleSignIn,
    handleSignOut,
    handleForgotPassword,
    handleTokenRefresh,
    initializeAuth,
    
    // Utilities
    navigateWithGuard
  };
};

export default useSignInLogic;