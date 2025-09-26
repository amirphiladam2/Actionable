// components/profile/EditModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { profileStyles } from './profileStyles';

const EditModal = ({ 
  visible, 
  onClose, 
  onSave, 
  field, 
  value, 
  title, 
  placeholder, 
  multiline = false, 
  keyboardType = 'default' 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value, visible]);

  const handleSave = async () => {
    if (field === 'username' && inputValue && !inputValue.match(/^[a-zA-Z0-9_]+$/)) {
      Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    if (field === 'email' && inputValue && !inputValue.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      await onSave(field, inputValue.trim());
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={profileStyles.modalContainer}>
        <View style={profileStyles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={profileStyles.modalCancelButton}>
            <Text style={profileStyles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={profileStyles.modalTitle}>{title}</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={profileStyles.modalSaveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#06b6d4" />
            ) : (
              <Text style={profileStyles.modalSaveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <TextInput
            style={[
              styles.modalInput,
              multiline && styles.modalInputMultiline
            ]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
            autoFocus
            maxLength={field === 'bio' ? 500 : field === 'username' ? 30 : 100}
          />
          {field === 'bio' && (
            <Text style={styles.characterCount}>
              {inputValue.length}/500 characters
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default EditModal;