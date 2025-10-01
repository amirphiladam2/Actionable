// components/TaskModal/TaskModal.js
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../constants/index';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../styles/taskModalStyles';

const { height } = Dimensions.get('window');

const TaskModal = ({ visible, onClose, onSave, initialTask = null }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    description: '',
    due_date: null,
    has_time: false,
  });

  // Native date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  const { colors } = React.useContext(ThemeContext);

  useEffect(() => {
    if (initialTask) {
      setTaskData({
        title: initialTask.title || '',
        category: initialTask.category || 'work',
        priority: initialTask.priority || 'medium',
        description: initialTask.description || '',
        due_date: initialTask.due_date ? new Date(initialTask.due_date) : null,
        has_time: !!initialTask.due_date && initialTask.time !== 'No time set',
      });
    } else {
      // Reset form for new task
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM tomorrow
      
      setTaskData({
        title: '',
        category: 'work',
        priority: 'medium',
        description: '',
        due_date: tomorrow,
        has_time: false,
      });
    }
  }, [initialTask, visible]);

  const handleSave = () => {
    if (!taskData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!taskData.due_date) {
      Alert.alert('Error', 'Please select a due date');
      return;
    }

    // Prepare the task data for saving
    const saveData = {
      ...taskData,
      due_date: taskData.due_date.toISOString(),
      time: taskData.has_time 
        ? taskData.due_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'No time set'
    };
    
    onSave(saveData);
    handleClose();
  };

  const handleClose = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    setTaskData({
      title: '',
      category: 'work',
      priority: 'medium',
      description: '',
      due_date: tomorrow,
      has_time: false,
    });
    onClose();
  };

  const updateField = useCallback((field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'Select date';
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return 'No time';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const getQuickDateOptions = () => {
    const today = new Date();
    const options = [];
    
    // Today
    const todayOption = new Date();
    todayOption.setHours(taskData.due_date?.getHours() || 9, taskData.due_date?.getMinutes() || 0, 0, 0);
    options.push({ label: 'Today', date: todayOption });
    
    // Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(taskData.due_date?.getHours() || 9, taskData.due_date?.getMinutes() || 0, 0, 0);
    options.push({ label: 'Tomorrow', date: tomorrow });
    
    return options;
  };


  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    const today = new Date();
    const currentDate = taskData.due_date || today;
    
    // Generate next 14 days for better UX
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.pickerButton, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateGrid}>
              {dates.map((date, index) => {
                const isSelected = currentDate.toDateString() === date.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateItem,
                      { 
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => {
                      const newDate = new Date(date);
                      if (taskData.due_date && taskData.has_time) {
                        newDate.setHours(taskData.due_date.getHours());
                        newDate.setMinutes(taskData.due_date.getMinutes());
                      }
                      updateField('due_date', newDate);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.dateDay,
                      { color: isSelected ? '#fff' : colors.text }
                    ]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[
                      styles.dateWeekday,
                      { color: isSelected ? '#fff' : colors.muted }
                    ]}>
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </Text>
                    {(isToday || isTomorrow) && (
                      <Text style={[
                        styles.dateLabel,
                        { color: isSelected ? '#fff' : colors.primary }
                      ]}>
                        {isToday ? 'Today' : 'Tomorrow'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimePicker = () => {
    if (!showTimePicker) return null;

    const currentTime = taskData.due_date || new Date();
    const popularTimes = [
      { hour: 9, minute: 0, label: '9:00 AM' },
      { hour: 12, minute: 0, label: '12:00 PM' },
      { hour: 14, minute: 0, label: '2:00 PM' },
      { hour: 17, minute: 0, label: '5:00 PM' },
      { hour: 19, minute: 0, label: '7:00 PM' },
    ];

    return (
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={[styles.pickerButton, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.timePickerContent} showsVerticalScrollIndicator={false}>
              <View style={styles.popularTimesSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Times</Text>
                <View style={styles.popularTimesGrid}>
                  {popularTimes.map((time, index) => {
                    const isSelected = taskData.has_time && 
                      currentTime.getHours() === time.hour && 
                      currentTime.getMinutes() === time.minute;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.popularTimeItem,
                          { 
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                          }
                        ]}
                        onPress={() => {
                          const newDate = new Date(taskData.due_date || new Date());
                          newDate.setHours(time.hour, time.minute, 0, 0);
                          updateField('due_date', newDate);
                          updateField('has_time', true);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.popularTimeText,
                          { color: isSelected ? '#fff' : colors.text }
                        ]}>
                          {time.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.allTimesSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>All Times</Text>
                <View style={styles.timeGrid}>
                  {Array.from({ length: 24 }, (_, hour) => 
                    Array.from({ length: 4 }, (_, minuteIndex) => {
                      const minute = minuteIndex * 15;
                      const time = new Date();
                      time.setHours(hour, minute, 0, 0);
                      const isSelected = taskData.has_time && 
                        currentTime.getHours() === hour && 
                        currentTime.getMinutes() === minute;
                      
                      return (
                        <TouchableOpacity
                          key={`${hour}-${minute}`}
                          style={[
                            styles.timeItem,
                            { 
                              backgroundColor: isSelected ? colors.primary : colors.background,
                              borderColor: isSelected ? colors.primary : colors.border,
                            }
                          ]}
                          onPress={() => {
                            const newDate = new Date(taskData.due_date || new Date());
                            newDate.setHours(hour, minute, 0, 0);
                            updateField('due_date', newDate);
                            updateField('has_time', true);
                            setShowTimePicker(false);
                          }}
                        >
                          <Text style={[
                            styles.timeText,
                            { color: isSelected ? '#fff' : colors.text }
                          ]}>
                            {time.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };


  const isFormValid = taskData.title.trim().length > 0 && taskData.due_date;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {initialTask ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={!isFormValid}
                >
                  <Text style={[
                    styles.saveButton, 
                    { color: colors.primary },
                    !isFormValid && styles.saveButtonDisabled
                  ]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Task Title */}
                <View style={styles.titleSection}>
                  <TextInput
                    style={[styles.titleInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="What needs to be done?"
                    placeholderTextColor={colors.muted}
                    value={taskData.title}
                    onChangeText={(text) => updateField('title', text)}
                    multiline
                    autoFocus
                    maxLength={200}
                  />
                  <Text style={[styles.characterCount, { color: colors.muted }]}>
                    {taskData.title.length}/200
                  </Text>
                </View>

                {/* Due Date & Time Section */}
                <View style={styles.dateTimeSection}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>Due Date & Time</Text>
                  
                  {/* Quick Date Options */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.quickDateOptions}>
                      {getQuickDateOptions().map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.quickDateOption,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            taskData.due_date?.toDateString() === option.date.toDateString() && 
                            styles.quickDateOptionSelected
                          ]}
                          onPress={() => updateField('due_date', option.date)}
                        >
                          <Text style={[
                            styles.quickDateOptionText,
                            { color: colors.text },
                            taskData.due_date?.toDateString() === option.date.toDateString() && 
                            styles.quickDateOptionTextSelected
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Date and Time Buttons */}
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity 
                      style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                      <Text style={[styles.dateTimeButtonText, { color: colors.text }]}>
                        {formatDate(taskData.due_date)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.dateTimeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <Text style={[styles.dateTimeButtonText, { color: colors.text }]}>
                        {taskData.has_time ? formatTime(taskData.due_date) : 'Add time'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Clear Time Option */}
                  {taskData.has_time && (
                    <TouchableOpacity 
                      style={styles.clearTimeButton}
                      onPress={() => updateField('has_time', false)}
                    >
                      <Text style={[styles.clearTimeText, { color: colors.primary }]}>Remove time</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Priority Selection */}
                <View style={styles.prioritySection}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>Priority</Text>
                  <View style={styles.priorityOptions}>
                    {TASK_PRIORITIES.map((priority) => (
                      <TouchableOpacity
                        key={priority.id}
                        style={[
                          styles.priorityOption,
                          { backgroundColor: colors.surface, borderColor: priority.color },
                          taskData.priority === priority.id && styles.priorityOptionSelected
                        ]}
                        onPress={() => updateField('priority', priority.id)}
                      >
                        <View style={[
                          styles.priorityDot, 
                          { backgroundColor: priority.color }
                        ]} />
                        <Text style={[
                          styles.priorityOptionText,
                          { color: colors.text },
                          taskData.priority === priority.id && styles.priorityOptionTextSelected
                        ]}>
                          {priority.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Category Selection */}
                <View style={styles.categorySection}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryOptions}>
                      {TASK_CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryOption,
                            { backgroundColor: colors.surface, borderColor: category.color },
                            taskData.category === category.id && styles.categoryOptionSelected
                          ]}
                          onPress={() => updateField('category', category.id)}
                        >
                          <Ionicons 
                            name={category.icon} 
                            size={20} 
                            color={taskData.category === category.id ? '#fff' : category.color} 
                          />
                          <Text style={[
                            styles.categoryOptionText,
                            { color: colors.text },
                            taskData.category === category.id && styles.categoryOptionTextSelected
                          ]}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>Notes</Text>
                  <TextInput
                    style={[styles.descriptionInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Add any additional notes..."
                    placeholderTextColor={colors.muted}
                    value={taskData.description}
                    onChangeText={(text) => updateField('description', text)}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  <Text style={[styles.characterCount, { color: colors.muted }]}>
                    {taskData.description.length}/500
                  </Text>
                </View>

                {/* Spacer for keyboard */}
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Date Picker */}
      {renderDatePicker()}

      {/* Custom Time Picker */}
      {renderTimePicker()}
    </>
  );
};

export default TaskModal;