// services/authService.js
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

export const authService = {
  getCurrentSession: async () => {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
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
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during sign out',
        },
      };
    }
  },

  deleteAccount: async () => {
    try {
      // First, get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: {
            message: 'User not found',
          },
        };
      }

      // Delete user's tasks first
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (tasksError) {
        console.error('Error deleting tasks:', tasksError);
        // Continue with account deletion even if tasks deletion fails
      }

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue with account deletion even if profile deletion fails
      }

      // Finally, delete the auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        return {
          success: false,
          error: {
            message: deleteError.message,
            status: deleteError.status,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred during account deletion',
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
      return { success: false, error: { message: 'Failed to handle auth callback' } };
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  },
};

// Export individual functions for easier importing
export const signOut = authService.signOut;
export const deleteAccount = authService.deleteAccount;
export const signUp = authService.signUp;
export const signIn = authService.signIn;
export const resetPassword = authService.resetPassword;
export const updatePassword = authService.updatePassword;
export const getCurrentSession = authService.getCurrentSession;
export const onAuthStateChange = authService.onAuthStateChange;
export const isAuthenticated = authService.isAuthenticated;