// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // New OAuth loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await authService.getCurrentSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setInitializing(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        setInitializing(false);
        
        // Clear OAuth loading state when authentication completes
        if (event === 'SIGNED_IN') {
          setIsAuthenticating(false);
          console.log('✅ OAuth sign in completed, clearing loading state');
        }
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticating(false);
          console.log('👋 Sign out completed');
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signUp(email, password);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      // Note: User might need to verify email before they can sign in
      return result;
    } catch (err) {
      const error = { message: 'An unexpected error occurred' };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signIn(email, password);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const error = { message: 'An unexpected error occurred' };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsAuthenticating(true); // Set OAuth loading state
    setError(null);
    
    try {
      console.log('🚀 Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'actionable://(auth)/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setIsAuthenticating(false);
        setError({ message: error.message });
        return { data: null, error };
      }

      console.log('🔗 Google OAuth initiated successfully');
      // Don't set isAuthenticating to false here - let onAuthStateChange handle it
      return { data, error: null };
      
    } catch (error) {
      console.error('Sign in with Google error:', error);
      setIsAuthenticating(false);
      setError({ message: 'Failed to sign in with Google' });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      setUser(null);
      return result;
    } catch (err) {
      const error = { message: 'An unexpected error occurred' };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const error = { message: 'An unexpected error occurred' };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    initializing,
    isAuthenticating, // New OAuth loading state
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};