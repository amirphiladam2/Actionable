// components/TaskItem/TaskItem.js
import React from 'react';
import { TouchableOpacity, View, Text ,StyleSheet} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '../utils/taskUtils';
import { TASK_CATEGORIES } from '../constants/index';


const TaskItem = ({ task, onToggle, onPress }) => {
  const category = getCategoryById(task.category, TASK_CATEGORIES);
  
  const handleToggle = () => onToggle?.(task.id);
  const handlePress = () => onPress?.(task);

  return (
    <TouchableOpacity
      style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
      onPress={handlePress || handleToggle}
      onLongPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${task.title}, ${task.completed ? 'completed' : 'incomplete'}`}
      accessibilityRole="button"
    >
      <View style={styles.taskLeft}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
          onPress={handleToggle}
          accessibilityLabel={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskText,
            task.completed && styles.taskTextCompleted
          ]}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={[styles.taskTime, { color: category.color }]}>
              {task.time}
            </Text>
            <Text style={[styles.taskCategory, { color: category.color }]}>
              • {category.name}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  taskItemCompleted: {
    opacity: 0.7,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskCategory: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default TaskItem;