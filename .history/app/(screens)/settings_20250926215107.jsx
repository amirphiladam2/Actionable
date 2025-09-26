import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { authService } from '../../services/authService'
import { taskNotificationService } from '../../services/notificationService'

export default function SettingsScreen() {
  const router = useRouter();
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('daily_summary_enabled');
      setDailySummaryEnabled(stored === 'true');
      const token = await AsyncStorage.getItem('push_token');
      setPushToken(token);
    };
    load();
  }, []);

  const toggleDailySummary = useCallback(async () => {
    const next = !dailySummaryEnabled;
    setDailySummaryEnabled(next);
    await AsyncStorage.setItem('daily_summary_enabled', next ? 'true' : 'false');
    try {
      if (next) {
        await taskNotificationService.scheduleDailySummary();
      } else {
        try { await Notifications.cancelScheduledNotificationAsync('daily_summary'); } catch {}
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update daily summary schedule');
    }
  }, [dailySummaryEnabled]);

  const handleRegisterPush = useCallback(async () => {
    const token = await taskNotificationService.registerForPushNotifications();
    if (token) {
      setPushToken(token);
      Alert.alert('Push Enabled', 'Device registered for push notifications');
    } else {
      Alert.alert('Notice', 'Push not available here. Use a dev build.');
    }
  }, []);

  const handleClearLocalNotifications = useCallback(async () => {
    await AsyncStorage.removeItem('stored_notifications');
    try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
    Alert.alert('Cleared', 'Local notifications and schedules cleared');
  }, []);

  const handleSignOut = useCallback(async () => {
    const result = await authService.signOut();
    if (result.success) {
      router.replace('/auth/AuthScreen');
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to sign out');
    }
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Image source={require('../../assets/images/avator.png')} style={styles.avatar} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Ionicons name="notifications-outline" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Daily Summary</Text>
                  <Text style={styles.rowSubtitle}>Get a summary every evening</Text>
                </View>
              </View>
              <Switch value={dailySummaryEnabled} onValueChange={toggleDailySummary} thumbColor={dailySummaryEnabled ? '#06b6d4' : '#f4f3f4'} trackColor={{ false: '#e2e8f0', true: '#bae6fd' }} />
            </View>

            <TouchableOpacity style={styles.row} onPress={handleRegisterPush}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Register Device for Push</Text>
                  <Text style={styles.rowSubtitle}>{pushToken ? 'Device registered' : 'Enable push notifications'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={handleClearLocalNotifications}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Clear Local Notifications</Text>
                  <Text style={styles.rowSubtitle}>Remove stored and scheduled items</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/(screens)/privacy')}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(8, 145, 178, 0.08)', borderColor: 'rgba(8, 145, 178, 0.2)' }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#0891b2" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Privacy & Security</Text>
                  <Text style={styles.rowSubtitle}>Manage your privacy options</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Sign Out</Text>
                  <Text style={styles.rowSubtitle}>Log out of your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#64748b',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    borderColor: '#bae6fd',
    backgroundColor: '#EEF6FF',
  },
  filterButtonText: {
    marginLeft: 6,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#1976D2',
  },
})