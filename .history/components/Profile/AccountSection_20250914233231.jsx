// components/profile/AccountSection.js
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import ProfileInfoCard from './ProfileInfoCard';
import { formatJoinDate } from './dateUtils';
import { profilestyles } from './profileStyles';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const AccountSection = ({ profile, onEditFullName, onEditUsername }) => {
  return (
    <View style={[styles.accountSection, isTablet && styles.accountSectionTablet]}>
      <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
        Account Details
      </Text>
      
      <ProfileInfoCard
        icon="person-outline"
        label="Full Name"
        value={profile?.full_name}
        editable
        onPress={() => onEditFullName(profile?.full_name)}
      />

      <ProfileInfoCard
        icon="at-outline"
        label="Username"
        value={profile?.username}
        editable
        onPress={() => onEditUsername(profile?.username)}
      />

      <ProfileInfoCard
        icon="calendar-outline"
        label="Member Since"
        value={formatJoinDate(profile?.created_at)}
      />
    </View>
  );
};

export default AccountSection;