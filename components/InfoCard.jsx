import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {useRouter} from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

const InfoCard = () => {
  const router=useRouter();
  const handlePress = (option) => {
    console.log(`${option} Tapped`);
  };

  return (
    <View style={styles.settings}>
      <Text style={styles.settingHeader}>Settings</Text>
      <View style={styles.cards}>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => handlePress('Profile')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="person" size={24} color="#848787" />
            <Text style={styles.settingText}>Profile</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => handlePress('Notification')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="notifications" size={24} color="#848787" />
            <Text style={styles.settingText}>Notification</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => handlePress('Appearance')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="color-palette" size={24} color="#848787" />
            <Text style={styles.settingText}>Appearance</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => handlePress('Privacy')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="lock-closed" size={24} color="#848787" />
            <Text style={styles.settingText}>Privacy</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => handlePress('Help and Support')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="help-circle" size={24} color="#848787" />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => router.push('/(auth)/AuthScreen')}
        >
          <View style={styles.settingRow}>
            <Ionicons name="log-out" size={24} color="#848787" />
            <Text style={styles.settingText}>Logout</Text>
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
    borderColor: '#ddd',
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