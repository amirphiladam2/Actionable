// hooks/useUpcomingTasks.js
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const useUpcomingTasks = () => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Helper function to check if a task should be in upcoming list
  const isUpcomingTask = useCallback((task) => {
    if (!task || !task.due_date || task.completed) return false;
    
    const taskDate = new Date(task.due_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    return taskDate >= tomorrow && taskDate <= nextWeek;
  }, []);

  // Fetch upcoming tasks from Supabase
  const fetchUpcomingTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('due_date', tomorrow.toISOString())
        .lte('due_date', nextWeek.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      setUpcomingTasks(data || []);
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle real-time updates more efficiently
  const handleRealtimeUpdate = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        if (isUpcomingTask(newRecord)) {
          setUpcomingTasks(current => {
            const updated = [...current, newRecord].sort((a, b) => 
              new Date(a.due_date) - new Date(b.due_date)
            );
            return updated.slice(0, 5); // Keep only top 5
          });
        }
        break;
        
      case 'UPDATE':
        setUpcomingTasks(current => {
          const filtered = current.filter(task => task.id !== newRecord.id);
          
          if (isUpcomingTask(newRecord)) {
            const updated = [...filtered, newRecord].sort((a, b) => 
              new Date(a.due_date) - new Date(b.due_date)
            );
            return updated.slice(0, 5);
          }
          
          return filtered;
        });
        break;
        
      case 'DELETE':
        setUpcomingTasks(current => 
          current.filter(task => task.id !== oldRecord.id)
        );
        break;
        
      default:
        // Fallback to full refetch for unknown events
        fetchUpcomingTasks();
    }
  }, [isUpcomingTask, fetchUpcomingTasks]);

  // Load upcoming tasks when user changes
  useEffect(() => {
    if (user) {
      fetchUpcomingTasks();
    } else {
      setUpcomingTasks([]);
    }
  }, [user, fetchUpcomingTasks]);

  // Set up real-time subscription with optimized handling
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('upcoming_tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, handleRealtimeUpdate]);

  // Auto-refresh to handle time-based changes (tasks becoming "upcoming")
  useEffect(() => {
    if (!user) return;

    // Refresh every hour to catch tasks that become "upcoming"
    const interval = setInterval(() => {
      fetchUpcomingTasks();
    }, 60 * 60 * 1000); // 1 hour

    // Also refresh at midnight to update "today/tomorrow" labels
    const now = new Date();
    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    
    const timeToMidnight = midnight.getTime() - now.getTime();
    const midnightTimeout = setTimeout(() => {
      fetchUpcomingTasks();
      // Set up daily refresh after the first midnight
      const dailyInterval = setInterval(fetchUpcomingTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeToMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [user, fetchUpcomingTasks]);

  // Helper function to format task time display
  const formatTaskTime = (dueDate) => {
    if (!dueDate) return 'No time set';
    
    const date = new Date(dueDate);
    const now = new Date();
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's within this week
    const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      const dayName = date.toLocaleDateString([], { weekday: 'long' });
      return `${dayName}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Default format
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get category icon and color
  const getCategoryDisplay = (category) => {
    const categoryMap = {
      work: { icon: 'briefcase-outline', color: '#3B82F6' },
      personal: { icon: 'person-outline', color: '#10B981' },
      shopping: { icon: 'bag-outline', color: '#F59E0B' },
      health: { icon: 'fitness-outline', color: '#EF4444' },
      study: { icon: 'book-outline', color: '#8B5CF6' },
      travel: { icon: 'airplane-outline', color: '#06B6D4' },
      default: { icon: 'checkmark-circle-outline', color: '#6B7280' }
    };
    
    return categoryMap[category] || categoryMap.default;
  };

  // Helper function to get priority styling
  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      high: { color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B' },
      medium: { color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#92400E' },
      low: { color: '#10B981', bgColor: '#F0FDF4', textColor: '#065F46' }
    };
    
    return priorityMap[priority] || priorityMap.medium;
  };

  // Transform tasks for display
  const transformedTasks = upcomingTasks.map(task => ({
    ...task,
    time: formatTaskTime(task.due_date),
    categoryDisplay: getCategoryDisplay(task.category),
    priorityDisplay: getPriorityDisplay(task.priority),
    // Add urgency indicator
    isUrgent: task.priority === 'high' && new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000),
    // Add time until due
    hoursUntilDue: Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60))
  }));

  return {
    upcomingTasks: transformedTasks,
    loading,
    error,
    refetch: fetchUpcomingTasks,
    hasUpcomingTasks: transformedTasks.length > 0,
    urgentTasksCount: transformedTasks.filter(task => task.isUrgent).length,
  };
};