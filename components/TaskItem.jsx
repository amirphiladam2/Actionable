// components/TaskItem/TaskItem.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TASK_CATEGORIES } from '../constants/index';
import { ThemeContext } from '../context/ThemeContext';
import { getCategoryById } from '../utils/taskUtils';


const TaskItem = ({ task, onToggle, onPress }) => {
  const category = getCategoryById(task.category, TASK_CATEGORIES);
  const { colors } = React.useContext(ThemeContext);
  
  const handleToggle = () => onToggle?.(task.id);
  const handlePress = () => onPress?.(task);

  return (
    <TouchableOpacity
      style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }, task.completed && styles.taskItemCompleted]}
      onPress={handlePress || handleToggle}
      onLongPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${task.title}, ${task.completed ? 'completed' : 'incomplete'}`}
      accessibilityRole="button"
    >
      <View style={styles.taskLeft}>
               <TouchableOpacity
                 style={[
                   styles.checkbox, 
                   { borderColor: colors.border }, 
                   task.completed && { backgroundColor: colors.primary, borderColor: colors.primary }
                 ]}
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
            { color: colors.text },
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
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: undefined, // Will be set inline using colors.primary
    borderColor: undefined, // Will be set inline using colors.primary
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
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