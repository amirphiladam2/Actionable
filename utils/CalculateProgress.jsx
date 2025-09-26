// utils/taskUtils.js
export const calculateProgress = (tasks) => {
    if (!tasks.length) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };
  
  export const getCategoryById = (categoryId, categories) => {
    return categories.find(cat => cat.id === categoryId) || { color: '#6B7280', name: 'Unknown' };
  };
  
  export const generateTaskId = () => Date.now() + Math.random();
  
  // hooks/useTasks.js
  import { useState, useCallback } from 'react';
  import { INITIAL_TASKS } from '../constants';
  import { generateTaskId } from '../utils/taskUtils';
  
  export const useTasks = () => {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
  
    const toggleTask = useCallback((taskId) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    }, []);
  
    const addTask = useCallback((newTaskData) => {
      if (!newTaskData.title?.trim()) return false;
      
      const task = {
        id: generateTaskId(),
        title: newTaskData.title.trim(),
        time: newTaskData.time || 'No time set',
        completed: false,
        category: newTaskData.category || 'work',
        description: newTaskData.description,
      };
      
      setTasks(prevTasks => [task, ...prevTasks]);
      return true;
    }, []);
  
    const deleteTask = useCallback((taskId) => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }, []);
  
    const updateTask = useCallback((taskId, updates) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    }, []);
  
    return {
      tasks,
      toggleTask,
      addTask,
      deleteTask,
      updateTask,
    };
  };