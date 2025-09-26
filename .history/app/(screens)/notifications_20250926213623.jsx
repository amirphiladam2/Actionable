// screens/NotificationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { taskNotificationService } from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const storedNotifications = await taskNotificationService.getStoredNotifications();
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const handleNotificationPress = async (notification) => {
    // Mark as read
    await taskNotificationService.markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notification.id ? { ...notif, read: true } : notif
      )
    );

    // Handle navigation based on notification type
    if (notification.data?.type === 'task_due' && notification.data?.taskId) {
      // Navigate to specific task
      navigation.navigate('TaskDetails', { taskId: notification.data.taskId });
    } else if (notification.data?.type === 'task_completed') {
      // Navigate to completed tasks or task details
      navigation.navigate('CompletedTasks');
    } else if (notification.data?.type === 'daily_summary') {
      // Navigate to dashboard or today's tasks
      navigation.navigate('Dashboard');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('stored_notifications');
            setNotifications([]);
            try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
          }
        }
      ]
    );
  };

  const createTestReminder = async () => {
    const result = await taskNotificationService.scheduleReminder({
      title: 'Test Reminder',
      body: 'This is a test reminder in 5 seconds',
      date: new Date(Date.now() + 5000),
      data: { type: 'reminder' },
    });
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to schedule reminder');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_due':
        return { name: 'time-outline', color: '#FF6B6B' };
      case 'task_completed':
        return { name: 'checkmark-circle-outline', color: '#4ECDC4' };
      case 'daily_summary':
        return { name: 'stats-chart-outline', color: '#45B7D1' };
      default:
        return { name: 'notifications-outline', color: '#95A5A6' };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    const days = Math.floor(diffInMinutes / 1440);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.data?.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon.name} 
              size={24} 
              color={icon.color} 
            />
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.notificationTitle,
              !item.read && styles.unreadText
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.data?.type === 'reminder' && (
            <TouchableOpacity
              onPress={async () => {
                await taskNotificationService.snoozeNotification(item.id, 10);
                Alert.alert('Snoozed', 'We will remind you again in 10 minutes');
              }}
              style={{ paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 }}
            >
              <Ionicons name="time-outline" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color="#BDC3C7" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You'll see task reminders and updates here
      </Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllNotifications}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : null}
        showsVerticalScrollIndicator={false}
      />
      {/* Quick test action */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={createTestReminder} style={{ alignSelf: 'center', padding: 12 }}>
          <Text style={{ color: '#1976D2', fontWeight: '600' }}>Create Test Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  unreadBannerText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    paddingTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;