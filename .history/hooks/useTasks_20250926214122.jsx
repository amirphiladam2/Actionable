// hooks/useTasks.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { taskNotificationService } from '../services/notificationService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  // Clear error when user performs new action
  const clearError = useCallback(() => {
    if (error) setError(null);
  }, [error]);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    clearError();

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, clearError]);

  // Load tasks when user changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Set up real-time subscription
  useEffect(() => {
    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!user) return;

    const subscription = supabase
      .channel(`tasks-${user.id}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setTasks(prev => {
                // Avoid duplicates
                if (prev.some(task => task.id === payload.new.id)) {
                  return prev;
                }
                return [payload.new, ...prev];
              });
              break;
            
            case 'UPDATE':
              setTasks(prev => 
                prev.map(task => 
                  task.id === payload.new.id ? payload.new : task
                )
              );
              break;
            
            case 'DELETE':
              setTasks(prev => prev.filter(task => task.id !== payload.old.id));
              break;
            
            default:
              console.warn('Unknown event type:', payload.eventType);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user]);

  const toggleTask = useCallback(async (taskId) => {
    if (!user) {
      setError('You must be logged in to toggle tasks');
      return false;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      setError('Task not found');
      return false;
    }

    clearError();
    const newCompletedState = !task.completed;

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, completed: newCompletedState } : t
      )
    );

    try {
      const { data: updated, error } = await supabase
        .from('tasks')
        .update({ 
          completed: newCompletedState,
          // updated_at will be handled by the database trigger
        })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      // If completed, cancel due notifications; if uncompleted and has due_date, schedule
      if (updated?.due_date) {
        if (newCompletedState) {
          await taskNotificationService.cancelTaskNotifications(updated.id);
        } else {
          await taskNotificationService.scheduleTaskDueNotification(updated);
        }
      }
      return true;
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(`Failed to update task: ${err.message}`);
      
      // Revert optimistic update
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, completed: task.completed } : t
        )
      );
      return false;
    }
  }, [tasks, user, clearError]);

  const addTask = useCallback(async (newTaskData) => {
    if (!user) {
      setError('You must be logged in to add tasks');
      return false;
    }

    if (!newTaskData?.title?.trim()) {
      setError('Task title is required');
      return false;
    }

    // Validate priority if provided
    if (newTaskData.priority && !['low', 'medium', 'high'].includes(newTaskData.priority)) {
      setError('Priority must be low, medium, or high');
      return false;
    }

    clearError();

    const taskData = {
      title: newTaskData.title.trim(),
      time: newTaskData.time || 'No time set',
      completed: false,
      category: newTaskData.category || 'work',
      priority: newTaskData.priority || 'medium',
      description: newTaskData.description || '',
      due_date: newTaskData.due_date || null,
      user_id: user.id,
      // Don't set created_at and updated_at - let database defaults handle it
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      // Real-time subscription will handle the update, but add it locally
      // in case real-time is delayed or fails
      setTasks(prevTasks => {
        // Avoid duplicates
        if (prevTasks.some(task => task.id === data.id)) {
          return prevTasks;
        }
        return [data, ...prevTasks];
      });
      // Schedule upcoming reminders
      if (data.due_date) {
        await taskNotificationService.scheduleTaskDueNotification(data);
      }
      
      return { success: true, task: data };
    } catch (err) {
      console.error('Error adding task:', err);
      setError(`Failed to add task: ${err.message}`);
      return { success: false, error: err.message };
    }
  }, [user, clearError]);

  const deleteTask = useCallback(async (taskId) => {
    if (!user) {
      setError('You must be logged in to delete tasks');
      return false;
    }

    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) {
      setError('Task not found');
      return false;
    }

    clearError();

    // Optimistic update
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      await taskNotificationService.cancelTaskNotifications(taskId);
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(`Failed to delete task: ${err.message}`);
      
      // Revert optimistic update
      setTasks(prevTasks => {
        // Insert back in the correct position (by created_at)
        const newTasks = [...prevTasks, taskToDelete];
        return newTasks.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
      });
      return false;
    }
  }, [tasks, user, clearError]);

  const updateTask = useCallback(async (taskId, updates) => {
    if (!user) {
      setError('You must be logged in to update tasks');
      return false;
    }

    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) {
      setError('Task not found');
      return false;
    }

    // Validate updates
    if (updates.title !== undefined && !updates.title?.trim()) {
      setError('Task title cannot be empty');
      return false;
    }

    clearError();

    // Prepare updates (updated_at will be handled by database trigger)
    const updateData = { ...updates };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Validate priority if being updated
    if (updateData.priority && !['low', 'medium', 'high'].includes(updateData.priority)) {
      setError('Priority must be low, medium, or high');
      return false;
    }

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updateData } : task
      )
    );

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(`Failed to update task: ${err.message}`);
      
      // Revert optimistic update
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? originalTask : task
        )
      );
      return false;
    }
  }, [tasks, user, clearError]);

  // Bulk operations
  const deleteCompletedTasks = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to delete tasks');
      return false;
    }

    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
      return true; // Nothing to delete
    }

    clearError();

    // Optimistic update
    setTasks(prevTasks => prevTasks.filter(task => !task.completed));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting completed tasks:', err);
      setError(`Failed to delete completed tasks: ${err.message}`);
      
      // Revert optimistic update
      setTasks(prevTasks => {
        const allTasks = [...prevTasks, ...completedTasks];
        return allTasks.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
      });
      return false;
    }
  }, [tasks, user, clearError]);

  const markAllComplete = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to update tasks');
      return false;
    }

    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) {
      return true; // Nothing to update
    }

    clearError();

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task => ({ ...task, completed: true }))
    );

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          // updated_at will be handled by the database trigger
        })
        .eq('user_id', user.id)
        .eq('completed', false);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error marking all tasks complete:', err);
      setError(`Failed to mark all tasks complete: ${err.message}`);
      
      // Revert optimistic update
      setTasks(prevTasks =>
        prevTasks.map(task => {
          const original = tasks.find(t => t.id === task.id);
          return original || task;
        })
      );
      return false;
    }
  }, [tasks, user, clearError]);

  // Filter and sort operations
  const getTasksByPriority = useCallback((priority) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTasksByCategory = useCallback((category) => {
    return tasks.filter(task => task.category === category);
  }, [tasks]);

  const getTasksDueToday = useCallback(() => {
    const today = new Date().toDateString();
    return tasks.filter(task => 
      task.due_date && new Date(task.due_date).toDateString() === today
    );
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      !task.completed
    );
  }, [tasks]);

  const getUpcomingTasks = useCallback((days = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) >= now && 
      new Date(task.due_date) <= futureDate &&
      !task.completed
    );
  }, [tasks]);

  const getSortedTasks = useCallback((sortBy = 'created_at', ascending = false) => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'due_date' || sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      // Handle priority sorting (high > medium > low)
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }
      
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });
  }, [tasks]);

  return {
    // State
    tasks,
    loading,
    error,
    
    // Actions
    toggleTask,
    addTask,
    deleteTask,
    updateTask,
    deleteCompletedTasks,
    markAllComplete,
    
    // Utilities
    refetch: fetchTasks,
    clearError,
    
    // Computed values
    completedCount: tasks.filter(t => t.completed).length,
    totalCount: tasks.length,
    hasCompletedTasks: tasks.some(t => t.completed),
    categories: [...new Set(tasks.map(t => t.category))],
    priorities: [...new Set(tasks.map(t => t.priority))],
    
    // Enhanced filtering and sorting
    getTasksByPriority,
    getTasksByCategory,
    getTasksDueToday,
    getOverdueTasks,
    getUpcomingTasks,
    getSortedTasks,
    
    // Statistics
    highPriorityCount: tasks.filter(t => t.priority === 'high' && !t.completed).length,
    overdueCount: tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      !t.completed
    ).length,
    dueTodayCount: tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date).toDateString() === new Date().toDateString() &&
      !t.completed
    ).length,
  };
};