import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import EnhancedTaskItem from '../../components/EnhancedTaskItem';
import Header from '../../components/Header';
import TaskModal from '../../components/TaskModal';
import { ThemeContext } from '../../context/ThemeContext';
import { useUpcomingTasks } from '../../hooks/upComingTasks';
import { useTasks } from '../../hooks/useTasks';

const UpcomingTasks = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { tasks, toggleTask, addTask, updateTask, deleteTask } = useTasks();
  const { upcomingTasks, loading: upcomingLoading } = useUpcomingTasks();
  const { colors } = React.useContext(ThemeContext);

  // Filter tasks to show only upcoming ones (with due dates)
  const upcomingTasksWithDetails = useMemo(() => {
    return upcomingTasks.map(upcomingTask => {
      // Find the full task details from the main tasks array
      const fullTask = tasks.find(task => task.id === upcomingTask.id);
      return fullTask || upcomingTask;
    });
  }, [upcomingTasks, tasks]);

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

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      const success = await deleteTask(taskToDelete.id);
      if (success) {
        Alert.alert('Success', 'Task deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete task');
      }
    }
  };

  const handleDuplicateTask = (task) => {
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      completed: false,
      id: undefined,
    };
    addTask(duplicatedTask);
    Alert.alert('Success', 'Task duplicated successfully');
  };

  const handleNotificationPress = () => {
    router.replace('/notifications');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      <Header 
        onNotificationPress={handleNotificationPress}
        notificationCount={1}
        navigation={navigation}
        showBackButton={true}
        onBackPress={handleBackPress}
        title="Upcoming Tasks"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {upcomingLoading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading upcoming tasks...</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {upcomingTasksWithDetails.length > 0 ? (
              upcomingTasksWithDetails.map((task) => (
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
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-outline" size={64} color={colors.muted} />
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>No upcoming tasks</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
                  Create tasks with due dates to see them here
                </Text>
                <TouchableOpacity 
                  style={[styles.createTaskButton, { backgroundColor: colors.primary }]}
                  onPress={handleCreateTask}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createTaskText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  taskList: {
    paddingVertical: 20,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  createTaskText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default UpcomingTasks;
