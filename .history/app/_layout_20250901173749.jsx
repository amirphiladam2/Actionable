import React, { useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import { supabase } from "../lib/supabase";
import { taskNotificationService } from "../services/notificationService";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Notifications setup
  useEffect(() => {
    console.log("🚀 Setting up notification listeners");

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📱 Notification received:", notification);

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

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);
        const notificationData = response.notification.request.content.data;
        const notificationId = notificationData?.notificationId;

        if (notificationId) {
          markNotificationAsRead(notificationId);
        }

        handleNotificationNavigation(notificationData);
      });

    return () => {
      console.log("🧹 Cleaning up notification listeners");
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 🔹 Handle user-specific notification setup
  useEffect(() => {
    if (!loading && user) {
      console.log("🔐 User authenticated:", user.email);
      console.log("📱 Registering for push notifications...");

      taskNotificationService
        .registerForPushNotifications()
        .then((token) => {
          if (token) {
            console.log("✅ Push notifications registered successfully");
          } else {
            console.log("ℹ️ Push notifications not available (likely Expo Go)");
          }
        })
        .catch((error) => {
          console.error("❌ Failed to register for push notifications:", error);
        });

      taskNotificationService.scheduleDailySummary().catch((error) => {
        console.error("❌ Failed to schedule daily summary:", error);
      });
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

      if (error) console.error("Error marking notification as received:", error);
    } catch (error) {
      console.error("Error marking notification as received:", error);
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

      if (error) console.error("Error marking notification as read:", error);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationNavigation = (data) => {
    if (!data?.type) return;
    console.log("🧭 Handling notification navigation:", data.type);
    // router.push(...) based on type
  };

  if (loading) {
    console.log("🔄 Showing loading screen");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0eb6e9ff" />
        <Toast />
      </View>
    );
  }

  console.log("📱 Rendering app layout, user:", user ? "authenticated" : "not authenticated");

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(screens)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <Toast />
    </>
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
