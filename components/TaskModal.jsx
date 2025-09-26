// components/TaskModal/TaskModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../constants/index';
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

  // Custom date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const updateField = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => {
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
  };

  const formatTime = (date) => {
    if (!date) return 'No time';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    
    // This Weekend
    const weekend = new Date();
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    weekend.setDate(today.getDate() + (daysUntilSaturday || 7));
    weekend.setHours(taskData.due_date?.getHours() || 10, taskData.due_date?.getMinutes() || 0, 0, 0);
    options.push({ label: 'Weekend', date: weekend });
    
    // Next Week
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(taskData.due_date?.getHours() || 9, taskData.due_date?.getMinutes() || 0, 0, 0);
    options.push({ label: 'Next Week', date: nextWeek });
    
    return options;
  };

  const getTimeOptions = () => {
    const times = [];
    // Cover full 24 hours (0-23)
    for (let hour = 0; hour < 24; hour++) {
      // Every 15 minutes for more precision
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push({
          label: time.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true // Shows AM/PM
          }),
          hour,
          minute,
          // Add period indicator for better grouping
          period: hour < 12 ? 'AM' : 'PM'
        });
      }
    }
    return times;
  };

  const handleTimeSelect = (hour, minute) => {
    const newDate = new Date(taskData.due_date);
    newDate.setHours(hour, minute, 0, 0);
    updateField('due_date', newDate);
    updateField('has_time', true);
    setShowTimePicker(false);
  };

  const renderCustomDatePicker = () => {
    if (!showDatePicker) return null;

    const today = new Date();
    const dates = [];
    
    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <View style={{ width: 60 }} />
            </View>
            
            <ScrollView style={styles.pickerScroll}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    taskData.due_date?.toDateString() === date.toDateString() && 
                    styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    const newDate = new Date(taskData.due_date || new Date());
                    newDate.setFullYear(date.getFullYear());
                    newDate.setMonth(date.getMonth());
                    newDate.setDate(date.getDate());
                    updateField('due_date', newDate);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    taskData.due_date?.toDateString() === date.toDateString() && 
                    styles.pickerItemTextSelected
                  ]}>
                    {formatDate(date)} - {date.toLocaleDateString([], { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCustomTimePicker = () => {
    if (!showTimePicker) return null;

    const times = getTimeOptions();
    
    // Group times by period for better organization
    const groupedTimes = times.reduce((acc, time) => {
      const period = time.period;
      if (!acc[period]) acc[period] = [];
      acc[period].push(time);
      return acc;
    }, {});

    return (
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => {
                updateField('has_time', false);
                setShowTimePicker(false);
              }}>
                <Text style={styles.pickerClear}>No Time</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {/* Popular Times Section */}
              <View style={styles.popularTimesSection}>
                <Text style={styles.sectionHeader}>Popular Times</Text>
                {[
                  { hour: 9, minute: 0, label: '9:00 AM' },
                  { hour: 12, minute: 0, label: '12:00 PM' },
                  { hour: 14, minute: 0, label: '2:00 PM' },
                  { hour: 17, minute: 0, label: '5:00 PM' },
                  { hour: 19, minute: 0, label: '7:00 PM' },
                ].map((time, index) => (
                  <TouchableOpacity
                    key={`popular-${index}`}
                    style={[
                      styles.popularTimeItem,
                      taskData.has_time && 
                      taskData.due_date?.getHours() === time.hour &&
                      taskData.due_date?.getMinutes() === time.minute && 
                      styles.pickerItemSelected
                    ]}
                    onPress={() => handleTimeSelect(time.hour, time.minute)}
                  >
                    <Text style={[
                      styles.popularTimeText,
                      taskData.has_time && 
                      taskData.due_date?.getHours() === time.hour &&
                      taskData.due_date?.getMinutes() === time.minute && 
                      styles.pickerItemTextSelected
                    ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* All Times - Grouped by AM/PM */}
              {Object.entries(groupedTimes).map(([period, periodTimes]) => (
                <View key={period}>
                  <Text style={styles.sectionHeader}>{period}</Text>
                  {periodTimes.map((time, index) => (
                    <TouchableOpacity
                      key={`${period}-${index}`}
                      style={[
                        styles.pickerItem,
                        taskData.has_time && 
                        taskData.due_date?.getHours() === time.hour &&
                        taskData.due_date?.getMinutes() === time.minute && 
                        styles.pickerItemSelected
                      ]}
                      onPress={() => handleTimeSelect(time.hour, time.minute)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        taskData.has_time && 
                        taskData.due_date?.getHours() === time.hour &&
                        taskData.due_date?.getMinutes() === time.minute && 
                        styles.pickerItemTextSelected
                      ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {initialTask ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={!isFormValid}
                >
                  <Text style={[
                    styles.saveButton, 
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
                    style={styles.titleInput}
                    placeholder="What needs to be done?"
                    placeholderTextColor="#A0A0A0"
                    value={taskData.title}
                    onChangeText={(text) => updateField('title', text)}
                    multiline
                    autoFocus
                    maxLength={200}
                  />
                  <Text style={styles.characterCount}>
                    {taskData.title.length}/200
                  </Text>
                </View>

                {/* Due Date & Time Section */}
                <View style={styles.dateTimeSection}>
                  <Text style={styles.optionLabel}>Due Date & Time</Text>
                  
                  {/* Quick Date Options */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.quickDateOptions}>
                      {getQuickDateOptions().map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.quickDateOption,
                            taskData.due_date?.toDateString() === option.date.toDateString() && 
                            styles.quickDateOptionSelected
                          ]}
                          onPress={() => updateField('due_date', option.date)}
                        >
                          <Text style={[
                            styles.quickDateOptionText,
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
                      style={styles.dateTimeButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                      <Text style={styles.dateTimeButtonText}>
                        {formatDate(taskData.due_date)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.dateTimeButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color="#4A90E2" />
                      <Text style={styles.dateTimeButtonText}>
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
                      <Text style={styles.clearTimeText}>Remove time</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Priority Selection */}
                <View style={styles.prioritySection}>
                  <Text style={styles.optionLabel}>Priority</Text>
                  <View style={styles.priorityOptions}>
                    {TASK_PRIORITIES.map((priority) => (
                      <TouchableOpacity
                        key={priority.id}
                        style={[
                          styles.priorityOption,
                          taskData.priority === priority.id && styles.priorityOptionSelected,
                          { borderColor: priority.color }
                        ]}
                        onPress={() => updateField('priority', priority.id)}
                      >
                        <View style={[
                          styles.priorityDot, 
                          { backgroundColor: priority.color }
                        ]} />
                        <Text style={[
                          styles.priorityOptionText,
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
                  <Text style={styles.optionLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryOptions}>
                      {TASK_CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryOption,
                            taskData.category === category.id && styles.categoryOptionSelected,
                            { borderColor: category.color }
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
                  <Text style={styles.optionLabel}>Notes</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Add any additional notes..."
                    placeholderTextColor="#A0A0A0"
                    value={taskData.description}
                    onChangeText={(text) => updateField('description', text)}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>
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
      {renderCustomDatePicker()}

      {/* Custom Time Picker */}
      {renderCustomTimePicker()}
    </>
  );
};

export default TaskModal;