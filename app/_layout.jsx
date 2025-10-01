import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { taskNotificationService } from "../services/notificationService";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ensure platform is properly detected
  useEffect(() => {
    // Set platform header for development builds
    if (__DEV__ && Platform.OS) {
      // This helps with platform detection in development builds
      global.__PLATFORM__ = Platform.OS;
    }
  }, []);

  const notificationListener = useRef();
  const responseListener = useRef();

  // 🔹 Check initial session on app start
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initSession();

    // 🔹 Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Force navigation on sign out
      if (event === 'SIGNED_OUT') {
        // Use replace to reset the navigation stack
        setTimeout(() => {
          router.replace('/auth/AuthScreen');
        }, 100);
      }
      
      // Ensure proper navigation on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          router.replace('/(screens)');
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 🔹 Notifications setup
  useEffect(() => {
    // Only set up notification listeners in development builds, not Expo Go
    if (Platform.OS !== 'web') {
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {

          Toast.show({
            type: "info",
            text1: notification.request.content.title,
            text2: notification.request.content.body,
            position: "top",
          });

          taskNotificationService.storeNotificationLocally(notification);

          const notificationId =
            notification.request.content.data?.notificationId;
          if (notificationId) {
            markNotificationAsReceived(notificationId);
          }
        });
    }

    // Only set up response listeners in development builds, not Expo Go
    if (Platform.OS !== 'web') {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const notificationData = response.notification.request.content.data;
          const notificationId = notificationData?.notificationId;

          if (notificationId) {
            markNotificationAsRead(notificationId);
          }

          handleNotificationNavigation(notificationData);
        });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // 🔹 Handle user-specific notification setup
  useEffect(() => {
    if (!loading && user) {
      taskNotificationService
        .registerForPushNotifications()
        .then((token) => {
          // Push notifications registered
        })
        .catch((error) => {
          // Silently handle error
        });

      // Only schedule notifications in development builds, not Expo Go
      if (Platform.OS !== 'web') {
        taskNotificationService.scheduleDailySummary().catch((error) => {
          // Silently handle error
        });
      }
    }
  }, [user, loading]);

  const markNotificationAsReceived = async (notificationId) => {
    if (!notificationId) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          received: true,
          received_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) {
        // Silently handle error
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) {
        // Silently handle error
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const handleNotificationNavigation = (data) => {
    if (!data?.type) return;
    // router.push(...) based on type
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0eb6e9ff" />
        <Toast />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(screens)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <Toast />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});