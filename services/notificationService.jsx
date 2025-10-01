// services/taskNotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
    // Store notification in local storage for the notifications page
    this.storeNotificationLocally(notification);
  };

  handleNotificationResponse = (response) => {
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
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData?.data;
      
      if (!token) {
        return null;
      }
      
      // Save token to database
      await this.savePushToken(token);
      
      return token;
    } catch (error) {
      return null;
    }
  }

  // Save push token to database
  async savePushToken(token) {
    try {
      // Don't save if token is null or undefined
      if (!token) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        // Silently handle error - token saving is not critical
      }

      // Also save locally for offline access
      await AsyncStorage.setItem('push_token', token);
    } catch (error) {
      // Silently handle error - token saving is not critical
    }
  }

  // Get stored push token
  async getPushToken() {
    try {
      return await AsyncStorage.getItem('push_token');
    } catch (error) {
      return null;
    }
  }

  // Store notifications locally for the notifications page
  async storeNotificationLocally(notification, timestampOverride) {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      const newNotification = {
        id: notification.request.identifier || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: timestampOverride || Date.now(),
        read: false
      };
      
      // Check if notification with same ID already exists
      const existingIndex = notifications.findIndex(n => n.id === newNotification.id);
      if (existingIndex === -1) {
        notifications.unshift(newNotification);
      } else {
        // Update existing notification instead of adding duplicate
        notifications[existingIndex] = newNotification;
      }
      
      // Keep only last 50 notifications
      const trimmed = notifications.slice(0, 50);
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(trimmed));
    } catch (error) {
      // Silently handle error - notification storage is not critical
    }
  }

  // Get stored notifications for the notifications page
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      // Clean up any duplicate IDs by ensuring uniqueness
      const uniqueNotifications = [];
      const seenIds = new Set();
      
      for (const notification of notifications) {
        // Migrate legacy or bad IDs: ensure string and not empty
        if (!notification.id || typeof notification.id !== 'string' || notification.id.trim() === '') {
          notification.id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        // Also rewrite any legacy fixed daily_summary id
        if (notification.id === 'daily_summary') {
          notification.id = `daily_summary_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        if (!seenIds.has(notification.id)) {
          seenIds.add(notification.id);
          uniqueNotifications.push(notification);
        } else {
          // Generate a new unique ID for duplicate
          const newId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          notification.id = newId;
          uniqueNotifications.push(notification);
        }
      }
      
      // Save cleaned notifications back to storage if we found duplicates
      if (uniqueNotifications.length !== notifications.length) {
        await AsyncStorage.setItem('stored_notifications', JSON.stringify(uniqueNotifications));
      }
      
      return uniqueNotifications;
    } catch (error) {
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
      // Silently handle error
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


      // Also store an upcoming reminder entry for the notifications page
      const upcomingLocal = {
        request: {
          identifier: `task_upcoming_${task.id}_${notificationTime.getTime()}`,
          content: {
            title: '⏳ Upcoming Task',
            body: `"${task.title}" is due in 1 hour`,
            data: {
              type: 'upcoming_task',
              taskId: task.id,
              taskTitle: task.title,
              scheduledFor: notificationTime.toISOString(),
            },
          },
        },
      };
      await this.storeNotificationLocally(upcomingLocal, notificationTime.getTime());
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
      // Silently handle error
    }
  }

  // Cancel task notifications
  async cancelTaskNotifications(taskId) {
    await Notifications.cancelScheduledNotificationAsync(`task_due_${taskId}`);
    await Notifications.cancelScheduledNotificationAsync(`task_due_now_${taskId}`);
  }

  // Schedule daily summary (call this when user opens app)
  async scheduleDailySummary() {
    // Cancel existing daily summary
    await this.cancelDailySummaries();

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
      identifier: `daily_summary_${Date.now()}`,
    });
  }

  // Cancel all scheduled daily summary notifications
  async cancelDailySummaries() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const dailySummaryNotifications = scheduledNotifications.filter(
        (notif) => notif.identifier && notif.identifier.startsWith('daily_summary')
      );
      for (const notification of dailySummaryNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      // Silently handle error
    }
  }

  // Navigation helpers (you'll need to implement these based on your navigation structure)
  navigateToTask(taskId) {
    // This should navigate to the specific task
    // Example: navigation.navigate('TaskDetails', { taskId });
  }

  navigateToCompletedTasks() {
    // This should navigate to completed tasks view
    // Example: navigation.navigate('CompletedTasks');
  }

  // Force clean all notifications (useful for debugging)
  async forceCleanNotifications() {
    try {
      await AsyncStorage.removeItem('stored_notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      // Silently handle error
    }
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
  forceCleanNotifications,
  cleanup
} = taskNotificationService;