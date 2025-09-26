// services/authService.js
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

export const authService = {
  getCurrentSession: async () => {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Error getting current session:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Optional: Add email confirmation redirect
          emailRedirectTo: `${Linking.createURL('/')}/auth/confirm`,
        }
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status,
          },
        };
      }

      return {
        success: true,
        data,
        user: data.user,
        needsConfirmation: !data.session, // If no session, email confirmation needed
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during sign up',
        },
      };
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status,
          },
        };
      }

      return {
        success: true,
        data,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during sign in',
        },
      };
    }
  },

  signInWithGoogle: async () => {
    try {
      const redirectUrl = Linking.createURL('/auth/callback');
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Add these for better mobile experience
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status,
          },
        };
      }

      return {
        success: true,
        data,
        url: data.url,
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during Google sign in',
        },
      };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during sign out',
        },
      };
    }
  },

  resetPassword: async (email) => {
    try {
      const redirectUrl = Linking.createURL('/auth/reset-password');
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            status: error.status,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during password reset',
        },
      };
    }
  },

  // Handle OAuth session from URL (mobile-friendly)
  handleAuthCallback: async (url) => {
    try {
      const urlObj = new URL(url);
      const hasHash = urlObj.hash && urlObj.hash.length > 1;
      const hashParams = new URLSearchParams(hasHash ? urlObj.hash.substring(1) : '');
      const queryParams = new URLSearchParams(urlObj.search);

      // New mobile flow: code exchange
      const code = queryParams.get('code');
      const state = queryParams.get('state');
      if (typeof supabase.auth.exchangeCodeForSession === 'function' && (code || state)) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          return { success: false, error: { message: error.message } };
        }
        return { success: true, data, session: data.session };
      }

      // Hash-based fallback (implicit flow)
      if (typeof supabase.auth.getSessionFromUrl === 'function' && (hasHash || url.includes('access_token='))) {
        const { data, error } = await supabase.auth.getSessionFromUrl(url);
        if (error) {
          return { success: false, error: { message: error.message } };
        }
        return { success: true, data, session: data.session };
      }

      // Legacy manual token set
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          return { success: false, error: { message: error.message } };
        }
        return { success: true, data, session: data.session };
      }

      return { success: false, error: { message: 'No session found in URL' } };
    } catch (error) {
      console.error('Handle auth callback error:', error);
      return { success: false, error: { message: 'Failed to handle auth callback' } };
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};