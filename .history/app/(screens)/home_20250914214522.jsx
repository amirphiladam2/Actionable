// screens/Home/Home.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import ProgressCard from '../../../components/ProgressCard';
import CategoryCard from '../../../components/CategoryCard';
import TaskItem from '../../../components/TaskItem';
import TaskModal from '../../../components/TaskModal';
import { useUpcomingTasks } from '../../../hooks/upComingTasks';
import { useNavigation, useRouter } from 'expo-router';
import { useTasks } from '../../../hooks/useTasks';
import { TASK_CATEGORIES } from '../../../constants';

const Home = () => {
  const navigation = useNavigation();
  const router = useRouter(); // Added this line
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // New state for category filter
  const { tasks, toggleTask, addTask, updateTask } = useTasks();
  const { upcomingTasks, loading: upcomingLoading } = useUpcomingTasks();
  
   
  // Filter tasks based on selected category
  const filteredTasks = useMemo(() => {
    if (!selectedCategory) {
      return tasks;
    }
    return tasks.filter(task => task.category === selectedCategory.id);
  }, [tasks, selectedCategory]);

  // Calculate task counts per category
  const categoriesWithCounts = useMemo(() => {
    return TASK_CATEGORIES.map(category => ({
      ...category,
      count: tasks.filter(task => task.category === category.id).length
    }));
  }, [tasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalVisible(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleCategoryPress = (category) => {
    // Toggle category filter
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null); // Clear filter if same category is pressed
    } else {
      setSelectedCategory(category);
    }
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
  };

  const handleNotificationPress = () => {
    // Handle notification press
    router.replace('/notifications');
  };

  const handleUpcomingTaskPress = (task) => {
    // Handle upcoming task press - could open task details or edit
    handleEditTask(task);
  };

  const handleSeeAllUpcoming = () => {
    // Navigate to full upcoming tasks view
    console.log('See all upcoming tasks');
    // navigation.navigate('UpcomingTasks');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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
              <Text style={styles.sectionTitle}>
                {selectedCategory ? `${selectedCategory.name} Tasks` : "Today's Tasks"}
              </Text>
              {selectedCategory && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={handleClearFilter}
                >
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.taskList}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onPress={handleEditTask}
                />
              ))
            ) : (
              <View style={styles.emptyTasksState}>
                <Ionicons 
                  name={selectedCategory ? selectedCategory.icon : "checkbox-outline"} 
                  size={40} 
                  color="#C7C7CC" 
                />
                <Text style={styles.emptyStateText}>
                  {selectedCategory 
                    ? `No ${selectedCategory.name.toLowerCase()} tasks` 
                    : "No tasks for today"
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
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
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={handleSeeAllUpcoming}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#06b6d4" />
              <Text style={styles.loadingText}>Loading upcoming tasks...</Text>
            </View>
          ) : (
            <View style={styles.upcomingList}>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.upcomingItem}
                    onPress={() => handleUpcomingTaskPress(task)}
                  >
                    <View style={[styles.upcomingIcon, { backgroundColor: task.color + '20' }]}>
                      <Ionicons name={task.icon} size={20} color={task.color} />
                    </View>
                    <View style={styles.upcomingContent}>
                      <Text style={styles.upcomingTitle}>{task.title}</Text>
                      <Text style={styles.upcomingTime}>{task.time}</Text>
                    </View>
                    <TouchableOpacity style={styles.upcomingAction}>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color="#C7C7CC" />
                  <Text style={styles.emptyStateText}>No upcoming tasks</Text>
                  <Text style={styles.emptyStateSubtext}>
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
        style={styles.fab}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#111827',
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
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  clearFilterText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  upcomingList: {
    gap: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
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
    color: '#111827',
    marginBottom: 2,
  },
  upcomingTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  upcomingAction: {
    padding: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#06b6d4',
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