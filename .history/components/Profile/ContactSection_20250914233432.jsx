// components/profile/ContactSection.js
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import ProfileInfoCard from './ProfileInfoCard';
import { profileStyles } from './profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const ContactSection = ({ user, profile, onEditEmail, onEditPhone }) => {
  return (
    <View style={[profileStyles.contactSection, isTablet && styles.contactSectionTablet]}>
      <Text style={[profileStyles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
        Contact Information
      </Text>
      
      <ProfileInfoCard
        icon="mail-outline"
        label="Email"
        value={user?.email}
        onPress={() => onEditEmail(user?.email)}
        editable
      />

      <ProfileInfoCard
        icon="call-outline"
        label="Phone"
        value={profile?.phone}
        onPress={() => onEditPhone(profile?.phone)}
        editable
      />
    </View>
  );
};

export default ContactSection;