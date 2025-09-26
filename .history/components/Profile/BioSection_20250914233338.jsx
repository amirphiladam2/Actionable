// components/profile/BioSection.js
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from './profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const BioSection = ({ profile, onEditBio }) => {
  return (
    <View style={[profileStyles.bioSection, isTablet && profileStyles.bioSectionTablet]}>
      <View style={profileStyles.bioHeader}>
        <Text style={[profileStyles.sectionTitle, isTablet && profileStyles.sectionTitleTablet]}>
          Bio
        </Text>
        <TouchableOpacity
          onPress={() => onEditBio(profile?.bio)}
          style={styles.editIconButton}
        >
          <Ionicons name="create-outline" size={isTablet ? 20 : 18} color="#06b6d4" />
        </TouchableOpacity>
      </View>
      <Text style={[
        styles.bio, 
        isTablet && styles.bioTablet, 
        !profile?.bio && styles.bioEmpty
      ]}>
        {profile?.bio || 'Add a bio to tell others about yourself'}
      </Text>
    </View>
  );
};

export default BioSection;