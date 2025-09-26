// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
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
    try {
      // Make sure this returns the correct structure
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'caloriee://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Sign in with Google error:', error);
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
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};