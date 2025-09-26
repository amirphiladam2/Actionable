import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { authService } from '../../services/authService';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const result = await authService.handleAuthCallback(url);
        if (result.success) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('(auth)/AuthScreen');
        }
      }
    };

    handleCallback();
  }, []);

  return null; // This component doesn't render anything
}