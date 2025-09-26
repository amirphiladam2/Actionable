// components/profile/ProfileInfoCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles} from './profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const ProfileInfoCard = ({ 
  icon, 
  label, 
  value, 
  onPress, 
  editable = false, 
  multiline = false 
}) => (
  <TouchableOpacity 
    style={[
      profileStyles.infoCard, 
      isTablet && profileStyles.infoCardTablet,
      editable && profileStyles.infoCardEditable
    ]}
    onPress={onPress}
    disabled={!editable && !onPress}
    activeOpacity={editable || onPress ? 0.7 : 1}
  >
    <View style={profileStyles.infoCardContent}>
      <View style={profileStyles.infoCardHeader}>
        <Ionicons 
          name={icon} 
          size={isTablet ? 24 : 20} 
          color="#06b6d4" 
          style={profileStyles.infoIcon} 
        />
        <Text style={[profileStyles.infoLabel, isTablet && profileStyles.infoLabelTablet]}>
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
          profileStyles.infoValue, 
          isTablet && profileStyles.infoValueTablet,
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

export default ProfileInfoCard;