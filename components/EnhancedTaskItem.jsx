import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TASK_CATEGORIES } from '../constants';
import { ThemeContext } from '../context/ThemeContext';
import { getCategoryById } from '../utils/taskUtils';

const EnhancedTaskItem = React.memo(({ 
  task, 
  onToggle, 
  onPress, 
  onEdit, 
  onDelete,
  onDuplicate 
}) => {
  const category = getCategoryById(task.category, TASK_CATEGORIES);
  const { colors } = React.useContext(ThemeContext);

  const handleToggle = () => onToggle?.(task.id);
  const handlePress = () => onPress?.(task);
  const handleEdit = () => onEdit?.(task);
  const handleDelete = () => onDelete?.(task);
  const handleDuplicate = () => onDuplicate?.(task);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return colors.muted;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'flag';
      case 'medium': return 'flag-outline';
      case 'low': return 'flag-outline';
      default: return 'flag-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.taskItem,
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
        },
        task.completed && styles.taskItemCompleted
      ]}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={handlePress}
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
            
            <View style={styles.taskInfo}>
              <View style={styles.taskHeader}>
                <Text style={[
                  styles.taskText,
                  { color: colors.text },
                  task.completed && styles.taskTextCompleted
                ]}>
                  {task.title}
                </Text>
                
                <View style={[styles.priorityContainer, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Ionicons 
                    name={getPriorityIcon(task.priority)} 
                    size={12} 
                    color={getPriorityColor(task.priority)} 
                  />
                  <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                    {task.priority}
                  </Text>
                </View>
              </View>
              
              <View style={styles.taskMeta}>
                <View style={styles.taskMetaLeft}>
                  <View style={[styles.categoryTag, { backgroundColor: category.color + '20' }]}>
                    <Ionicons name={category.icon} size={12} color={category.color} />
                    <Text style={[styles.categoryText, { color: category.color }]}>
                      {category.name}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.taskMetaRight}>
                  {task.time && task.time !== 'No time set' && (
                    <Text style={[styles.timeText, { color: colors.muted }]}>
                      {task.time}
                    </Text>
                  )}
                  {task.due_date && (
                    <Text style={[styles.dueDateText, { color: colors.muted }]}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent + '20' }]}
            onPress={handleDuplicate}
          >
            <Ionicons name="copy" size={16} color={colors.accent} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
  },
  taskItemCompleted: {
    opacity: 0.7,
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  taskMetaRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedTaskItem;
