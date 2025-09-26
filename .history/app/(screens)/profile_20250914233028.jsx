// components/profile/ProfileViewScreen.js
import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  View, 
  ActivityIndicator, 
  Text,
  Dimensions 
} from 'react-native';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileHeaderSection from '../../components/Profile/ProfileHeaderSection';
import BioSection from '../../components/Profile/BioSection';
import ContactSection from '../../components/Profile/ContactSection';
import AccountSection from '../../components/Profile/AccountSection';
import EditModal from '../../components/Profile/EditModal';
import { useProfile } from '../../components/Profile/useProfile';
import { useImageUpload } from '../../components/Profile/useImageUpload';
import { profileStyles } from '../../components/Profile/profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const ProfileViewScreen = ({ onBack }) => {
  const {
    user,
    profile,
    loading,
    updating,
    editModal,
    openEditModal,
    closeEditModal,
    handleSaveField
  } = useProfile();

  const { handleImagePicker } = useImageUpload(user, profile, (newProfile) => {
    // Update profile state when image is uploaded
    handleSaveField('avatar_url', newProfile.avatar_url, false);
  });

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={profileStyles.loadingContent}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={[profileStyles.loadingText, isTablet && profileStyles.loadingTextTablet]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileStyles.container}>
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
        <ProfileHeaderSection 
          user={user}
          profile={profile}
          onImagePicker={handleImagePicker}
        />

        <BioSection 
          profile={profile}
          onEditBio={(value) => openEditModal('bio', value, 'Edit Bio', 'Tell us about yourself...', true)}
        />

        <ContactSection 
          user={user}
          profile={profile}
          onEditEmail={(value) => openEditModal('email', value, 'Edit Email', 'Enter your email address', false, 'email-address')}
          onEditPhone={(value) => openEditModal('phone', value, 'Edit Phone', 'Enter your phone number', false, 'phone-pad')}
        />

        <AccountSection 
          profile={profile}
          onEditFullName={(value) => openEditModal('full_name', value, 'Edit Full Name', 'Enter your full name')}
          onEditUsername={(value) => openEditModal('username', value, 'Edit Username', 'Choose a unique username')}
        />
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