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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loadingTextTablet: {
    fontSize: 18,
  },
  updatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  updatingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#06b6d4',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollContentTablet: {
    paddingBottom: 48,
    paddingHorizontal: isTablet ? Math.max(20, (screenWidth - 600) / 2) : 0,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
  },
  profileHeaderTablet: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    marginHorizontal: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
  avatarTablet: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
  },
  avatarTextTablet: {
    fontSize: 42,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#06b6d4',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cameraIconContainerTablet: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileNameTablet: {
    fontSize: 28,
    marginBottom: 6,
  },
  profileUsername: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  profileUsernameTablet: {
    fontSize: 18,
    marginBottom: 10,
  },
  joinDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  joinDateTablet: {
    fontSize: 16,
  },

  // Bio Section
  bioSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
  },
  bioSectionTablet: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editIconButton: {
    padding: 4,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  bioTablet: {
    fontSize: 18,
    lineHeight: 26,
  },
  bioEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Section Styles
  contactSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
  },
  contactSectionTablet: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accountSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderRadius: isSmallScreen ? 12 : 0,
  },
  accountSectionTablet: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionTitleTablet: {
    fontSize: 20,
    marginBottom: 20,
  },

  // Info Card Styles
  infoCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoCardTablet: {
    paddingVertical: 20,
  },
  infoCardEditable: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  infoLabelTablet: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 32,
  },
  infoValueTablet: {
    fontSize: 18,
  },
  infoValueEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  infoValueMultiline: {
    lineHeight: 22,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  modalInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
});

export default ProfileViewScreen;