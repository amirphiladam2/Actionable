// components/profile/ProfileHeaderSection.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatJoinDate } from './dateUtils';
import { profileStyles} from './profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const ProfileHeaderSection = ({ user, profile, onImagePicker }) => {
  return (
    <View style={[profileStyles.profileHeader, isTablet && profileStyles.profileHeaderTablet]}>
      <View style={profileStyles.avatarSection}>
        <TouchableOpacity onPress={onImagePicker} activeOpacity={0.8}>
          {profile?.avatar_url ? (
            <Image 
              source={{ uri: profile.avatar_url }} 
              style={[profileStyles.avatar, isTablet &&profileStyles.avatarTablet]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.defaultAvatar, isTablet && styles.avatarTablet]}>
              <Text style={[styles.avatarText, isTablet && styles.avatarTextTablet]}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 'U'}
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
  );
};

export default ProfileHeaderSection;