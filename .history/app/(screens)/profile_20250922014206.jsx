import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const [fullName, setFullName] = useState('Parves Ahamad');
  const [gender, setGender] = useState('Male');
  const [birthDate, setBirthDate] = useState('05-01-2001');
  const [phone, setPhone] = useState('(+880) 1759263000');
  const [email, setEmail] = useState('nihobparvesahammad@gmail.com');
  const [username, setUsername] = useState('@parvesahamad');

  // Edit states for each field
  const [editingField, setEditingField] = useState(null);

  const handleSave = () => {
    // Handle save functionality
    setEditingField(null); // Stop editing when saving
    console.log('Profile saved');
  };

  const handleBack = () => {
    // Handle back navigation
    console.log('Go back');
  };

  const toggleEdit = (fieldName) => {
    setEditingField(editingField === fieldName ? null : fieldName);
  };

  const renderField = (label, value, fieldName, onChangeText, keyboardType = 'default', placeholder = '') => {
    const isEditing = editingField === fieldName;
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.editableInput]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              keyboardType={keyboardType}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
              autoFocus
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <View style={[styles.input, styles.displayInput]}>
              <Text style={styles.displayText}>{value}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => toggleEdit(fieldName)}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create-outline"} 
              size={18} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Parves Ahamad</Text>
          <Text style={styles.profileHandle}>@parvesahamad</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          {renderField('Full name', fullName, 'fullName', setFullName, 'default', 'Enter your full name')}

          {/* Gender and Birth Date Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderField('Gender', gender, 'gender', setGender, 'default', 'Gender')}
            </View>
            <View style={styles.halfWidth}>
              {renderField('Birth date', birthDate, 'birthDate', setBirthDate, 'default', 'DD-MM-YYYY')}
            </View>
          </View>

          {/* Phone */}
          {renderField('Phone', phone, 'phone', setPhone, 'phone-pad', 'Enter phone number')}

          {/* Email */}
          {renderField('Email', email, 'email', setEmail, 'email-address', 'Enter email address')}

          {/* Username */}
          {renderField('User name', username, 'username', setUsername, 'default', 'Enter username')}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f8f8',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#06b6d4',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f8f8f8',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  profileHandle: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editableInput: {
    backgroundColor: '#fff',
    color: '#000',
  },
  displayInput: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
  },
  saveButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;