import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const InfoCard = () => {
  const router=useRouter();
  const { colors } = React.useContext(ThemeContext);
  const handlePress = (option) => {
    // Handle option press
  };

  return (
    <View style={styles.settings}>
      <Text style={[styles.settingHeader, { color: colors.text }]}>Settings</Text>
      <View style={styles.cards}>
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => handlePress('Profile')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="person" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Profile</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => handlePress('Notification')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="notifications" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Notification</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => handlePress('Appearance')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="color-palette" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Appearance</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => handlePress('Privacy')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="lock-closed" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => handlePress('Help and Support')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="help-circle" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => router.push('/(auth)/AuthScreen')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="log-out" size={24} color={colors.muted} />
            <Text style={[styles.settingText, { color: colors.text }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settings: {
    marginTop: 10,
    marginRight: 15,
  },
  settingHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  cards: {
    marginLeft: 15,
    padding: 10,
  },
  settingItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default InfoCard;