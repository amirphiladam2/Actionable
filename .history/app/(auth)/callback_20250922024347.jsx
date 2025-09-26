import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { authService } from '../../services/authService';
import { View, ActivityIndicator, Text } from 'react-native';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL that triggered this callback
        let url = await Linking.getInitialURL();
        
        // If no initial URL, this might be a live callback
        if (!url) {
          // Listen for incoming URL
          const handleUrl = ({ url: incomingUrl }) => {
            if (incomingUrl) {
              processCallback(incomingUrl);
            }
          };

          const subscription = Linking.addEventListener('url', handleUrl);
          
          // Cleanup after 5 seconds if no URL received
          setTimeout(() => {
            subscription?.remove();
            router.replace('/(auth)');
          }, 5000);
          
          return () => subscription?.remove();
        } else {
          await processCallback(url);
        }
      } catch (error) {
        console.error('Error in callback handler:', error);
        router.replace('/(auth)');
      }
    };

    const processCallback = async (url) => {
      console.log('Processing callback URL:', url);
      
      try {
        const result = await authService.handleAuthCallback(url);
        if (result.success) {
          console.log('OAuth success, redirecting to home');
          router.replace('/(screens)/home');
        } else {
          console.error('OAuth failed:', result.error);
          router.replace('/(auth)');
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        router.replace('/(auth)');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#4285f4" />
      <Text style={{ marginTop: 16, fontSize: 16 }}>Completing sign in...</Text>
    </View>
  );
}