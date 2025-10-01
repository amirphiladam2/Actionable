// screens/Home/Home.js
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../components/CategoryCard';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import EnhancedTaskItem from '../../components/EnhancedTaskItem';
import FilterModal from '../../components/FilterModal';
import Header from '../../components/Header';
import ProgressCard from '../../components/ProgressCard';
import TaskModal from '../../components/TaskModal';
import { TASK_CATEGORIES } from '../../constants';
import { ThemeContext } from '../../context/ThemeContext';
import { useUpcomingTasks } from '../../hooks/upComingTasks';
import { useTasks } from '../../hooks/useTasks';

const Home = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    priority: null,
    status: null,
    dateRange: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const { tasks, toggleTask, addTask, updateTask, deleteTask } = useTasks();
  const { upcomingTasks, loading: upcomingLoading } = useUpcomingTasks();
  const { colors } = React.useContext(ThemeContext);
  
   
  // Advanced filtering and sorting
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply category filter (from quick actions)
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory.id);
    }

    // Apply advanced filters
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(task => !task.completed);
      }
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'due_date':
          aValue = new Date(a.due_date || '9999-12-31');
          bValue = new Date(b.due_date || '9999-12-31');
          break;
        default: // created_at
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, selectedCategory, filters]);

  // Calculate task counts per category
  const categoriesWithCounts = useMemo(() => {
    return TASK_CATEGORIES.map(category => ({
      ...category,
      count: tasks.filter(task => task.category === category.id).length
    }));
  }, [tasks]);

  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setModalVisible(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setModalVisible(true);
  }, []);

  const handleSaveTask = useCallback((taskData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }
  }, [selectedTask, updateTask, addTask]);

  const handleCategoryPress = useCallback((category) => {
    // Toggle category filter
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null); // Clear filter if same category is pressed
    } else {
      setSelectedCategory(category);
    }
  }, [selectedCategory]);

  const handleClearFilter = useCallback(() => {
    setSelectedCategory(null);
    setFilters({
      category: null,
      priority: null,
      status: null,
      dateRange: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  }, []);

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelectedCategory(null); // Clear category filter when using advanced filters
  }, []);

  const handleDeleteTask = useCallback((task) => {
    setTaskToDelete(task);
    setDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (taskToDelete) {
      const success = await deleteTask(taskToDelete.id);
      if (success) {
        Alert.alert('Success', 'Task deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete task');
      }
    }
  }, [taskToDelete, deleteTask]);

  const handleDuplicateTask = useCallback((task) => {
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      completed: false,
      id: undefined, // Let the addTask function generate a new ID
    };
    addTask(duplicatedTask);
    Alert.alert('Success', 'Task duplicated successfully');
  }, [addTask]);

  const handleNotificationPress = () => {
    router.replace('/notifications');
  };

  const handleUpcomingTaskPress = (task) => {
    handleEditTask(task);
  };

  const handleSeeAllUpcoming = () => {
    router.push('/upcoming');
  };

  const hasActiveFilters = selectedCategory || Object.values(filters).some(value => 
    value !== null && value !== 'created_at' && value !== 'desc'
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      <Header 
        onNotificationPress={handleNotificationPress}
        notificationCount={1}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.section}>
          <ProgressCard tasks={tasks} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesScroll}
          >
            {categoriesWithCounts.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
                isSelected={selectedCategory?.id === category.id}
                count={category.count}
              />
            ))}
          </ScrollView>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory ? `${selectedCategory.name} Tasks` : "Today's Tasks"}
              </Text>
              {selectedCategory && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={handleClearFilter}
                >
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                  <Text style={[styles.clearFilterText, { color: colors.muted }]}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { 
                  backgroundColor: hasActiveFilters ? colors.primary + '20' : colors.surface,
                  borderColor: hasActiveFilters ? colors.primary : colors.border,
                  borderWidth: hasActiveFilters ? 1 : 0,
                }
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons 
                name={hasActiveFilters ? "filter" : "filter-outline"} 
                size={20} 
                color={hasActiveFilters ? colors.primary : colors.muted} 
              />
              {hasActiveFilters && (
                <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterBadgeText}>!</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.taskList}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <EnhancedTaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onPress={handleEditTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onDuplicate={handleDuplicateTask}
                />
              ))
            ) : (
              <View style={[styles.emptyTasksState, { backgroundColor: colors.surface }]}>
                <Ionicons 
                  name={selectedCategory ? selectedCategory.icon : "checkbox-outline"} 
                  size={40} 
                  color={colors.muted} 
                />
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                  {selectedCategory 
                    ? `No ${selectedCategory.name.toLowerCase()} tasks` 
                    : "No tasks for today"
                  }
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
                  {selectedCategory 
                    ? `Create a new ${selectedCategory.name.toLowerCase()} task to get started`
                    : "Create a new task to get started"
                  }
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Tasks</Text>
              {upcomingTasks.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.countText, { color: colors.primary }]}>
                    {upcomingTasks.length}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.seeAllButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleSeeAllUpcoming}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {upcomingLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Loading upcoming tasks...</Text>
            </View>
          ) : (
            <View style={styles.upcomingList}>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 3).map((task, index) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.upcomingItem, 
                      { 
                        backgroundColor: colors.surface,
                        borderLeftColor: colors.primary,
                        borderLeftWidth: 4,
                      }
                    ]}
                    onPress={() => handleUpcomingTaskPress(task)}
                  >
                    <View style={styles.upcomingLeft}>
                      <View style={[styles.upcomingIcon, { backgroundColor: task.color + '20' }]}>
                        <Ionicons name={task.icon} size={20} color={task.color} />
                      </View>
                      <View style={styles.upcomingContent}>
                        <Text style={[styles.upcomingTitle, { color: colors.text }]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View style={styles.upcomingMeta}>
                          <Text style={[styles.upcomingTime, { color: colors.muted }]}>
                            {task.time}
                          </Text>
                          {task.due_date && (
                            <Text style={[styles.upcomingDue, { color: colors.muted }]}>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.upcomingRight}>
                      <View style={[styles.priorityIndicator, { backgroundColor: task.color }]}>
                        <Text style={styles.priorityText}>{task.priority?.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                  <Ionicons name="calendar-outline" size={48} color={colors.muted} />
                  <Text style={[styles.emptyStateText, { color: colors.muted }]}>No upcoming tasks</Text>
                  <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
                    Create tasks with due dates to see them here
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button - Outside ScrollView */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreateTask}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialTask={selectedTask}
        onSave={handleSaveTask}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  clearFilterText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  categoriesScroll: {
    marginHorizontal: -4,
  },
  taskList: {
    gap: 8,
  },
  emptyTasksState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
  },
  upcomingList: {
    gap: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingDue: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default Home;