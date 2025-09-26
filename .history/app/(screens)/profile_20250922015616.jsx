import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase'; 

const EditProfileScreen = () => {
  // Profile data state
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    phone: '',
    email: '',
    avatar_url: ''
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit states for each field
  const [editingField, setEditingField] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'Unable to get user information');
        return;
      }
      
      setCurrentUser(user);
      
      // Get profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        Alert.alert('Error', 'Failed to load profile');
        return;
      }
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          phone: data.phone || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setEditingField(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          bio: profile.bio,
          phone: profile.phone,
          email: profile.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) {
        Alert.alert('Error', 'Failed to save profile');
        return;
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    if (!currentUser) return;
    
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your avatar');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const asset = result.assets[0];
        
        // Create FormData for upload
        const fileExt = asset.uri.split('.').pop();
        const fileName = `${currentUser.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          type: `image/${fileExt}`,
          name: fileName,
        });
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          Alert.alert('Error', 'Failed to upload avatar');
          return;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
        
        if (updateError) {
          Alert.alert('Error', 'Failed to update profile with new avatar');
          return;
        }
        
        // Update local state
        setProfile(prev => ({
          ...prev,
          avatar_url: publicUrl
        }));
        
        Alert.alert('Success', 'Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const toggleEdit = (fieldName) => {
    setEditingField(editingField === fieldName ? null : fieldName);
  };

  const renderField = (label, value, fieldName, keyboardType = 'default', placeholder = '') => {
    const isEditing = editingField === fieldName;
    
    const handleChange = (text) => {
      setProfile(prev => ({
        ...prev,
        [fieldName]: text
      }));
    };
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.editableInput]}
              value={value}
              onChangeText={handleChange}
              placeholder={placeholder}
              keyboardType={keyboardType}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
              autoFocus
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <View style={[styles.input, styles.displayInput]}>
              <Text style={styles.displayText}>{value || placeholder}</Text>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              source={{ 
                uri: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' 
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleImagePicker}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size={16} color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {profile.full_name || 'Your Name'}
          </Text>
          <Text style={styles.profileHandle}>
            {profile.username ? `@${profile.username}` : '@username'}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          {renderField('Full name', profile.full_name, 'full_name', 'default', 'Enter your full name')}

          {/* Username */}
          {renderField('Username', profile.username, 'username', 'default', 'Enter username')}

          {/* Bio */}
          {renderField('Bio', profile.bio, 'bio', 'default', 'Tell us about yourself')}

          {/* Phone */}
          {renderField('Phone', profile.phone, 'phone', 'phone-pad', 'Enter phone number')}

          {/* Email */}
          {renderField('Email', profile.email, 'email', 'email-address', 'Enter email address')}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
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
    backgroundColor: '#000',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;