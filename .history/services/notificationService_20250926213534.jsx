// services/taskNotificationService.js
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class TaskNotificationService {
  constructor() {
    this.notificationListeners = [];
    this.setupNotificationListeners();
    this.isPushSupported = this.checkPushSupport();
    this.snoozeMinutes = 10;
  }

  // Check if push notifications are supported in current environment
  checkPushSupport() {
    // In Expo Go, push notifications are not supported in SDK 53+
    const isExpoGo = __DEV__ && !process.env.EXPO_USE_DEVELOPMENT_BUILD;
    return !isExpoGo;
  }

  setupNotificationListeners() {
    // Handle notifications when app is in foreground
    const foregroundListener = Notifications.addNotificationReceivedListener(this.handleForegroundNotification);
    
    // Handle notification tap when app is in background
    const responseListener = Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
    
    // Store listeners for cleanup
    this.notificationListeners.push(foregroundListener, responseListener);
  }

  // Clean up listeners (call this when component unmounts)
  cleanup() {
    this.notificationListeners.forEach(listener => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    });
    this.notificationListeners = [];
  }

  handleForegroundNotification = (notification) => {
    console.log('📱 Foreground notification:', notification);
    // Store notification in local storage for the notifications page
    this.storeNotificationLocally(notification);
  };

  handleNotificationResponse = (response) => {
    console.log('👆 Notification tapped:', response);
    const { data } = response.notification.request.content;
    
    // Handle different notification types
    if (data?.type === 'task_due' && data?.taskId) {
      // Navigate to specific task
      this.navigateToTask(data.taskId);
    } else if (data?.type === 'task_completed') {
      // Navigate to completed tasks
      this.navigateToCompletedTasks();
    }
    
    // Store notification
    this.storeNotificationLocally(response.notification);
  };

  // Register for push notifications and get token
  async registerForPushNotifications() {
    try {
      if (!this.isPushSupported) {
        console.log('📱 Push notifications not supported in Expo Go. Use development build for full functionality.');
        console.log('📱 Local notifications will still work for scheduled tasks.');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData?.data;
      
      if (!token) {
        console.log('No push token received');
        return null;
      }

      console.log('📱 Push token obtained:', token);
      
      // Save token to database
      await this.savePushToken(token);
      
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      
      // Check if it's the known Expo Go error
      if (error.message?.includes('removed from Expo Go')) {
        console.log('📱 Push notifications require a development build. Local notifications will still work.');
      }
      
      return null;
    }
  }

  // Save push token to database
  async savePushToken(token) {
    try {
      // Don't save if token is null or undefined
      if (!token) {
        console.log('No push token to save');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, cannot save push token');
        return;
      }

      // Save to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          push_token: token,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving push token to database:', error);
      } else {
        console.log('✅ Push token saved to database');
      }

      // Also save locally for offline access
      await AsyncStorage.setItem('push_token', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Get stored push token
  async getPushToken() {
    try {
      return await AsyncStorage.getItem('push_token');
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Store notifications locally for the notifications page
  async storeNotificationLocally(notification) {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      const newNotification = {
        id: notification.request.identifier || Date.now().toString(),
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: Date.now(),
        read: false
      };
      
      notifications.unshift(newNotification);
      
      // Keep only last 50 notifications
      const trimmed = notifications.slice(0, 50);
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Get stored notifications for the notifications page
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      const updated = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Task-specific notification methods
  async scheduleReminder({ id, title, body, date, data = {}, repeats = false }) {
    try {
      const trigger = typeof date === 'number' || date instanceof Date
        ? { date }
        : null;

      const identifier = id || `reminder_${Date.now()}`;

      const scheduledId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || '⏰ Reminder',
          body: body || 'You have a reminder',
          data: { type: 'reminder', ...data },
          sound: 'default',
        },
        trigger: repeats ? { ...trigger, repeats: true } : trigger,
        identifier,
      });

      return { success: true, id: scheduledId };
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async snoozeNotification(notificationId, minutes = this.snoozeMinutes) {
    try {
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Snoozed Reminder',
          body: `We will remind you again in ${minutes} minutes`,
          data: { type: 'reminder_snoozed', originalId: notificationId },
          sound: 'default',
        },
        trigger: { date: snoozeTime },
        identifier: `snooze_${notificationId}`,
      });
      return { success: true };
    } catch (error) {
      console.error('Error snoozing notification:', error);
      return { success: false, error: error.message };
    }
  }

  async scheduleTaskDueNotification(task) {
    if (!task.due_date) return;

    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    // Schedule notification 1 hour before due date
    const notificationTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    if (notificationTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Task Due Soon!',
          body: `"${task.title}" is due in 1 hour`,
          data: {
            type: 'task_due',
            taskId: task.id,
            taskTitle: task.title
          },
          sound: 'default',
        },
        trigger: {
          date: notificationTime,
        },
        identifier: `task_due_${task.id}`,
      });

      console.log(`📅 Scheduled due notification for task: ${task.title}`);
    }

    // Schedule notification on due date
    if (dueDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Task Due Now!',
          body: `"${task.title}" is due now`,
          data: {
            type: 'task_due',
            taskId: task.id,
            taskTitle: task.title
          },
          sound: 'default',
        },
        trigger: {
          date: dueDate,
        },
        identifier: `task_due_now_${task.id}`,
      });
    }
  }

  async sendTaskCompletedNotification(task) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Task Completed!',
        body: `Great job completing "${task.title}"!`,
        data: {
          type: 'task_completed',
          taskId: task.id,
          taskTitle: task.title
        },
        sound: 'default',
      },
      trigger: null, // Immediate
      identifier: `task_completed_${task.id}`,
    });

    console.log(`✅ Sent completion notification for: ${task.title}`);
  }

  async sendDailyTaskSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get today's tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString());

      if (tasks && tasks.length > 0) {
        const pendingTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);

        let body = '';
        if (pendingTasks.length > 0) {
          body = `You have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} due today`;
        }
        if (completedTasks.length > 0) {
          body += body ? ` and completed ${completedTasks.length}` : `You completed ${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} today`;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📊 Daily Task Summary',
            body,
            data: {
              type: 'daily_summary',
              pendingCount: pendingTasks.length,
              completedCount: completedTasks.length
            },
            sound: 'default',
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  // Cancel task notifications
  async cancelTaskNotifications(taskId) {
    await Notifications.cancelScheduledNotificationAsync(`task_due_${taskId}`);
    await Notifications.cancelScheduledNotificationAsync(`task_due_now_${taskId}`);
    console.log(`🗑️ Cancelled notifications for task: ${taskId}`);
  }

  // Schedule daily summary (call this when user opens app)
  async scheduleDailySummary() {
    // Cancel existing daily summary
    await Notifications.cancelScheduledNotificationAsync('daily_summary');

    // Schedule for 8 PM today
    const now = new Date();
    const summaryTime = new Date();
    summaryTime.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM, schedule for tomorrow
    if (summaryTime <= now) {
      summaryTime.setDate(summaryTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Daily Task Summary',
        body: 'Tap to see your daily progress',
        data: { type: 'daily_summary' },
        sound: 'default',
      },
      trigger: {
        date: summaryTime,
        repeats: true,
      },
      identifier: 'daily_summary',
    });
  }

  // Navigation helpers (you'll need to implement these based on your navigation structure)
  navigateToTask(taskId) {
    // This should navigate to the specific task
    console.log(`Navigate to task: ${taskId}`);
    // Example: navigation.navigate('TaskDetails', { taskId });
  }

  navigateToCompletedTasks() {
    // This should navigate to completed tasks view
    console.log('Navigate to completed tasks');
    // Example: navigation.navigate('CompletedTasks');
  }
}

// Export singleton instance
export const taskNotificationService = new TaskNotificationService();

// Export individual methods for easier importing
export const {
  registerForPushNotifications,
  savePushToken,
  getPushToken,
  scheduleTaskDueNotification,
  sendTaskCompletedNotification,
  sendDailyTaskSummary,
  cancelTaskNotifications,
  scheduleDailySummary,
  getStoredNotifications,
  markNotificationAsRead,
  cleanup
} = taskNotificationService;