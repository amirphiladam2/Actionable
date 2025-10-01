// screens/Settings/Settings.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { taskNotificationService } from '../../services/notificationService';

export default function Settings() {
  const { colors, isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  const router = useRouter();
  const [dailySummariesEnabled, setDailySummariesEnabled] = useState(true);
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);
  
  // Update local state when context changes
  React.useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);
  
  // Simple state-based positioning - no complex animation
  const themeToggleLeft = localIsDarkMode ? 20 : 2;
  const notificationToggleLeft = dailySummariesEnabled ? 20 : 2;

  const handleToggleTheme = useCallback(() => {
    // Update local state immediately for instant visual feedback
    setLocalIsDarkMode(!localIsDarkMode);
    // Then toggle the theme context
    toggleTheme();
  }, [toggleTheme, localIsDarkMode]);

  const handleToggleDailySummaries = useCallback(async () => {
    try {
      if (dailySummariesEnabled) {
        // Disable daily summaries
        await taskNotificationService.cancelDailySummaries();
        setDailySummariesEnabled(false);
        Alert.alert('Success', 'Daily summaries have been disabled');
      } else {
        // Enable daily summaries
        await taskNotificationService.scheduleDailySummary();
        setDailySummariesEnabled(true);
        Alert.alert('Success', 'Daily summaries have been enabled');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update daily summaries setting');
    }
  }, [dailySummariesEnabled]);

  const handlePrivacyPress = useCallback(() => {
    router.push('/(screens)/privacy');
  }, [router]);

  const handleSupportPress = useCallback(() => {
    router.push('/(screens)/support');
  }, [router]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Import auth service
              const { signOut } = await import('../../services/authService');
              await signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  }, [router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Import auth service for account deletion
                      const { deleteAccount } = await import('../../services/authService');
                      await deleteAccount();
                      router.replace('/');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account. Please contact support.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your app preferences
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleToggleTheme}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons 
                    name={localIsDarkMode ? 'moon' : 'sunny'} 
                    size={22} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Theme
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    {localIsDarkMode ? 'Dark mode enabled' : 'Light mode enabled'}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleContainer, { backgroundColor: localIsDarkMode ? colors.primary : colors.border }]}>
                <View style={[styles.toggleCircle, { 
                  backgroundColor: '#fff',
                  left: themeToggleLeft,
                }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleToggleDailySummaries}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons 
                    name="notifications" 
                    size={22} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Daily Summaries
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    {dailySummariesEnabled ? 'Receive daily task summaries' : 'Daily summaries disabled'}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleContainer, { backgroundColor: dailySummariesEnabled ? colors.primary : colors.border }]}>
                <View style={[styles.toggleCircle, { 
                  backgroundColor: '#fff',
                  left: notificationToggleLeft,
                }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemWithBorder]}
              onPress={handlePrivacyPress}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Privacy & Security
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Manage your privacy settings
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleSupportPress}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="help-circle" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Help & Support
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Get help and contact support
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.settingItem, styles.settingItemWithBorder]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' + '15' }]}>
                  <Ionicons name="log-out" size={22} color="#FF6B6B" />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Logout
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF4757' + '15' }]}>
                  <Ionicons name="trash" size={22} color="#FF4757" />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: '#FF4757' }]}>
                    Delete Account
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Permanently delete your account
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Actionable v1.0.0
          </Text>
          <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
            Built by AmirDevStudio
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  circleToggleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  circleToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    fontWeight: '400',
  },
});
