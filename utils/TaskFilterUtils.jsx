// utils/TaskFilterUtils.js

/**
 * Utility functions for filtering and sorting tasks
 */

export const filterTasks = (tasks, filters, searchQuery = '') => {
  let filtered = [...tasks];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(task => filters.categories.includes(task.category));
  }

  // Priority filter
  if (filters.priorities && filters.priorities.length > 0) {
    filtered = filtered.filter(task => filters.priorities.includes(task.priority));
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  // Completed tasks filter
  if (!filters.showCompleted) {
    filtered = filtered.filter(task => !task.completed);
  }

  // Sort tasks
  if (filters.sortBy) {
    filtered = sortTasks(filtered, filters.sortBy, filters.sortOrder);
  }

  return filtered;
};

export const filterByDateRange = (tasks, dateRange) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);

  switch (dateRange) {
    case 'today':
      return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        return taskDay.getTime() === today.getTime();
      });

    case 'tomorrow':
      return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        return taskDay.getTime() === tomorrow.getTime();
      });

    case 'thisWeek':
      return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today && taskDate <= weekEnd;
      });

    case 'overdue':
      return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate < today && !task.completed;
      });

    case 'upcoming':
      return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today;
      });

    default:
      return tasks;
  }
};

export const sortTasks = (tasks, sortBy, sortOrder = 'asc') => {
  return tasks.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'dueDate':
        comparison = new Date(a.due_date) - new Date(b.due_date);
        break;

      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;

      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;

      case 'created':
        comparison = new Date(a.created_at) - new Date(b.created_at);
        break;

      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;

      case 'completed':
        comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
        break;

      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const groupTasksByDate = (tasks) => {
  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);

  tasks.forEach(task => {
    const taskDate = new Date(task.due_date);
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    if (taskDate < today && !task.completed) {
      groups.overdue.push(task);
    } else if (taskDay.getTime() === today.getTime()) {
      groups.today.push(task);
    } else if (taskDay.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(task);
    } else if (taskDate <= weekEnd) {
      groups.thisWeek.push(task);
    } else {
      groups.later.push(task);
    }
  });

  return groups;
};

export const groupTasksByCategory = (tasks) => {
  return tasks.reduce((groups, task) => {
    const category = task.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {});
};

export const groupTasksByPriority = (tasks) => {
  const groups = {
    high: [],
    medium: [],
    low: []
  };

  tasks.forEach(task => {
    if (groups[task.priority]) {
      groups[task.priority].push(task);
    }
  });

  return groups;
};

export const getTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdue = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    return taskDate < today && !task.completed;
  }).length;

  const dueToday = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    return taskDay.getTime() === today.getTime() && !task.completed;
  }).length;

  const dueTomorrow = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    const tomorrow = new Date(today.getTime() + 86400000);
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    return taskDay.getTime() === tomorrow.getTime() && !task.completed;
  }).length;

  return {
    total,
    completed,
    pending,
    overdue,
    dueToday,
    dueTomorrow,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export const isTaskOverdue = (task) => {
  if (task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(task.due_date);
  return taskDate < today;
};

export const isTaskDueToday = (task) => {
  const today = new Date();
  const taskDate = new Date(task.due_date);
  const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return taskDay.getTime() === todayDay.getTime();
};

export const isTaskDueTomorrow = (task) => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const taskDate = new Date(task.due_date);
  const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  return taskDay.getTime() === tomorrowDay.getTime();
};

export const getUpcomingTasks = (tasks, limit = 5) => {
  const upcoming = tasks
    .filter(task => !task.completed)
    .filter(task => {
      const taskDate = new Date(task.due_date);
      const today = new Date();
      return taskDate >= today;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const searchTasks = (tasks, query) => {
  if (!query.trim()) return tasks;
  
  const searchTerm = query.toLowerCase().trim();
  
  return tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm) ||
    task.category.toLowerCase().includes(searchTerm)
  );
};