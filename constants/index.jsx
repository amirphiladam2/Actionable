// constants/index.js
export const TASK_CATEGORIES = [
  {
    id: 'work',
    name: 'Work',
    icon: 'briefcase-outline',
    color: '#3B82F6',
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'person-outline',
    color: '#10B981',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'bag-outline',
    color: '#F59E0B',
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'fitness-outline',
    color: '#EF4444',
  },
  {
    id: 'study',
    name: 'Study',
    icon: 'book-outline',
    color: '#8B5CF6',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'airplane-outline',
    color: '#06B6D4',
  },
];

export const TASK_PRIORITIES = [
  {
    id: 'low',
    name: 'Low',
    color: '#10B981',
    bgColor: '#F0FDF4',
    textColor: '#065F46',
  },
  {
    id: 'medium',
    name: 'Medium',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    textColor: '#92400E',
  },
  {
    id: 'high',
    name: 'High',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    textColor: '#991B1B',
  },
];

export const TASK_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  OVERDUE: 'overdue',
};

// Helper functions
export const getCategoryById = (id) => {
  return TASK_CATEGORIES.find(category => category.id === id) || TASK_CATEGORIES[0];
};

export const getPriorityById = (id) => {
  return TASK_PRIORITIES.find(priority => priority.id === id) || TASK_PRIORITIES[1];
};