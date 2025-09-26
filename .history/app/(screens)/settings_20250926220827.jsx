import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { authService } from '../../services/authService'
import { ThemeContext } from '../../context/ThemeContext'
import { taskNotificationService } from '../../services/notificationService'

export default function SettingsScreen() {
  const router = useRouter();
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const { theme, colors, toggleTheme } = React.useContext(ThemeContext);

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
      Alert.alert(
        'Push Notifications', 
        'Push notifications require a development build or production app.\n\nIn Expo Go, only local notifications work for scheduled reminders.'
      );
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Customize your experience</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }] }>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Ionicons name="notifications-outline" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Daily Summary</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Get a summary every evening</Text>
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Register Device for Push</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{pushToken ? 'Device registered' : 'Enable push notifications'}</Text>
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Clear Local Notifications</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Remove stored and scheduled items</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }] }>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/(screens)/privacy')}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(8, 145, 178, 0.08)', borderColor: 'rgba(8, 145, 178, 0.2)' }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#0891b2" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Privacy & Security</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Manage your privacy options</Text>
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
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Sign Out</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Log out of your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={() => Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted. Contact support for full deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Data Cleared', 'Your profile data removal is handled from support.') }
              ]
            )}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Delete Account</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Permanently remove your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }] }>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Ionicons name="moon-outline" size={18} color="#06b6d4" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{theme === 'dark' ? 'On' : 'Off'}</Text>
                </View>
              </View>
              <Switch value={theme === 'dark'} onValueChange={toggleTheme} thumbColor={'#06b6d4'} trackColor={{ false: '#e2e8f0', true: '#bae6fd' }} />
            </View>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
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