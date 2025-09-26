// components/profile/ProfileViewScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Linking,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import ProfileHeader from '../../components/Profile/ProfileHeader';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isSmallScreen = screenWidth < 375;

const ProfileInfoCard = ({ icon, label, value, onPress, editable = false, multiline = false }) => (
  <TouchableOpacity 
    style={[
      styles.infoCard, 
      isTablet && styles.infoCardTablet,
      editable && styles.infoCardEditable
    ]}
    onPress={onPress}
    disabled={!editable && !onPress}
    activeOpacity={editable || onPress ? 0.7 : 1}
  >
    <View style={styles.infoCardContent}>
      <View style={styles.infoCardHeader}>
        <Ionicons 
          name={icon} 
          size={isTablet ? 24 : 20} 
          color="#06b6d4" 
          style={styles.infoIcon} 
        />
        <Text style={[styles.infoLabel, isTablet && styles.infoLabelTablet]}>
          {label}
        </Text>
        {editable && (
          <Ionicons 
            name="create-outline" 
            size={isTablet ? 20 : 16} 
            color="#06b6d4" 
          />
        )}
      </View>
      <Text 
        style={[
          styles.infoValue, 
          isTablet && styles.infoValueTablet,
          !value && styles.infoValueEmpty,
          multiline && styles.infoValueMultiline
        ]}
        numberOfLines={multiline ? 0 : 1}
      >
        {value || 'Not provided'}
      </Text>
    </View>
  </TouchableOpacity>
);

const EditModal = ({ visible, onClose, onSave, field, value, title, placeholder, multiline = false, keyboardType = 'default' }) => {
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.modalSaveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#06b6d4" />
            ) : (
              <Text style={styles.modalSaveText}>Save</Text>
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

const ProfileViewScreen = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModal, setEditModal] = useState({
    visible: false,
    field: null,
    value: '',
    title: '',
    placeholder: '',
    multiline: false,
    keyboardType: 'default'
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        Alert.alert('Authentication Error', 'Please sign in to continue');
        return;
      }

      setUser(authUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePress = (phone) => {
    if (phone) {
      const phoneUrl = `tel:${phone}`;
      Linking.canOpenURL(phoneUrl).then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      });
    }
  };

  const handleEmailPress = (email) => {
    if (email) {
      const emailUrl = `mailto:${email}`;
      Linking.canOpenURL(emailUrl).then(supported => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      });
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };

  const openEditModal = (field, currentValue, title, placeholder, multiline = false, keyboardType = 'default') => {
    setEditModal({
      visible: true,
      field,
      value: currentValue,
      title,
      placeholder,
      multiline,
      keyboardType
    });
  };

  const closeEditModal = () => {
    setEditModal({
      visible: false,
      field: null,
      value: '',
      title: '',
      placeholder: '',
      multiline: false,
      keyboardType: 'default'
    });
  };

  const handleSaveField = async (field, value) => {
    if (!user) return;

    try {
      setUpdating(true);

      if (field === 'email') {
        // Update email in auth
        const { error: emailError } = await supabase.auth.updateUser({
          email: value
        });
        if (emailError) throw emailError;
        
        // Update local user state
        setUser(prev => ({ ...prev, email: value }));
      } else {
        // Update profile fields
        const updateData = { [field]: value || null };
        
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;

        // Update local profile state
        setProfile(prev => ({ ...prev, [field]: value }));
      }

      Alert.alert('Success', `${field.replace('_', ' ')} updated successfully`);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', `Failed to update ${field.replace('_', ' ')}. Please try again.`);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile picture.');
        return;
      }

      Alert.alert(
        'Select Image',
        'Choose how you want to select your profile picture',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: () => pickImage('camera') },
          { text: 'Gallery', onPress: () => pickImage('gallery') }
        ]
      );
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const pickImage = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUpdating(true);

      // Create a unique filename
      const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
      
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={[styles.loadingText, isTablet && styles.loadingTextTablet]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ProfileHeader
        title="Profile"
        onBack={onBack}
        showSave={false}
      />

      {updating && (
        <View style={styles.updatingBanner}>
          <ActivityIndicator size="small" color="#06b6d4" />
          <Text style={styles.updatingText}>Updating...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, isTablet && styles.profileHeaderTablet]}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleImagePicker} activeOpacity={0.8}>
              {profile?.avatar_url ? (
                <Image 
                  source={{ uri: profile.avatar_url }} 
                  style={[styles.avatar, isTablet && styles.avatarTablet]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.defaultAvatar, isTablet && styles.avatarTablet]}>
                  <Text style={[styles.avatarText, isTablet && styles.avatarTextTablet]}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.cameraIconContainer, isTablet && styles.cameraIconContainerTablet]}>
                <Ionicons name="camera" size={isTablet ? 18 : 16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isTablet && styles.profileNameTablet]}>
              {profile?.full_name || 'Your Name'}
            </Text>
            <Text style={[styles.profileUsername, isTablet && styles.profileUsernameTablet]}>
              @{profile?.username || 'username'}
            </Text>
            <Text style={[styles.joinDate, isTablet && styles.joinDateTablet]}>
              {formatJoinDate(profile?.created_at)}
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={[styles.bioSection, isTablet && styles.bioSectionTablet]}>
          <View style={styles.bioHeader}>
            <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
              Bio
            </Text>
            <TouchableOpacity
              onPress={() => openEditModal('bio', profile?.bio, 'Edit Bio', 'Tell us about yourself...', true)}
              style={styles.editIconButton}
            >
              <Ionicons name="create-outline" size={isTablet ? 20 : 18} color="#06b6d4" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.bio, isTablet && styles.bioTablet, !profile?.bio && styles.bioEmpty]}>
            {profile?.bio || 'Add a bio to tell others about yourself'}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={[styles.contactSection, isTablet && styles.contactSectionTablet]}>
          <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
            Contact Information
          </Text>
          
          <ProfileInfoCard
            icon="mail-outline"
            label="Email"
            value={user?.email}
            onPress={() => openEditModal('email', user?.email, 'Edit Email', 'Enter your email address', false, 'email-address')}
            editable
          />

          <ProfileInfoCard
            icon="call-outline"
            label="Phone"
            value={profile?.phone}
            onPress={() => openEditModal('phone', profile?.phone, 'Edit Phone', 'Enter your phone number', false, 'phone-pad')}
            editable
          />
        </View>

        {/* Account Information */}
        <View style={[styles.accountSection, isTablet && styles.accountSectionTablet]}>
          <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
            Account Details
          </Text>
          
          <ProfileInfoCard
            icon="person-outline"
            label="Full Name"
            value={profile?.full_name}
            editable
            onPress={() => openEditModal('full_name', profile?.full_name, 'Edit Full Name', 'Enter your full name')}
          />

          <ProfileInfoCard
            icon="at-outline"
            label="Username"
            value={profile?.username}
            editable
            onPress={() => openEditModal('username', profile?.username, 'Edit Username', 'Choose a unique username')}
          />

          <ProfileInfoCard
            icon="calendar-outline"
            label="Member Since"
            value={formatJoinDate(profile?.created_at)}
          />
        </View>
      </ScrollView>

      <EditModal
        visible={editModal.visible}
        onClose={closeEditModal}
        onSave={handleSaveField}
        field={editModal.field}
        value={editModal.value}
        title={editModal.title}
        placeholder={editModal.placeholder}
        multiline={editModal.multiline}
        keyboardType={editModal.keyboardType}
      />
    </SafeAreaView>
  );
};

export default ProfileViewScreen;