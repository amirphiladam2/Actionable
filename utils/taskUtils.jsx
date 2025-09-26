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
  