// components/Header/Header.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const Header = ({
  onNotificationPress,
  notificationCount = 0,
  navigation,
}) => {
  const [userName, setUserName] = useState('Guest');
  const [greeting, setGreeting] = useState('Good Morning');
  const { day, month } = getFormattedDate();

  // Fetch user data from Supabase
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update greeting based on time of day
  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (!error && profile?.full_name) {
          // Extract first name only
          const firstName = profile.full_name.split(' ')[0];
          setUserName(firstName);
        } else {
          // Fallback to user email first part if no profile name
          const emailName = user.email?.split('@')[0] || 'User';
          setUserName(emailName);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let newGreeting = 'Good Morning🌄';
    
    if (hour >= 12 && hour < 17) {
      newGreeting = 'Good Afternoon ☀️';
    } else if (hour >= 17 || hour < 4) {
      newGreeting = 'Good Evening🌙';
    }
    
    setGreeting(newGreeting);
  };

  return (
    <View style={styles.header}>
      {/* Background shapes */}
      <View style={styles.circleShape} />
      <View style={styles.rectangleShape} />
      
      <View style={styles.headerContent}>
        <LeftSection
          greeting={greeting}
          userName={userName}
          onMenuPress={() => navigation?.openDrawer?.()}
        />
        <RightSection
          day={day}
          month={month}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
        />
      </View>
    </View>
  );
};

const LeftSection = ({ greeting, userName, onMenuPress }) => (
  <View style={styles.headerLeft}>
    <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
      <Ionicons name="menu-outline" size={24} color="#4B5563" />
    </TouchableOpacity>
    <View style={styles.textContainer}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.userName}>{userName}</Text>
    </View>
  </View>
);

const RightSection = ({ day, month, onNotificationPress, notificationCount }) => (
  <View style={styles.headerRight}>
    <View style={styles.dateContainer}>
      <Text style={styles.dateNumber}>{day}</Text>
      <Text style={styles.dateMonth}>{month}</Text>
    </View>
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={onNotificationPress}
      accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
    >
      <Ionicons name="notifications-outline" size={24} color="#4B5563" />
      {notificationCount > 0 && <View style={styles.notificationBadge} />}
    </TouchableOpacity>
  </View>
);

const getFormattedDate = () => {
  const today = new Date();
  return {
    day: today.getDate(),
    month: today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8fafc',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
  },
  // Background shapes
  circleShape: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(167, 139, 250, 0.28)',
  },
  rectangleShape: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 100,
    height: 80,
    backgroundColor: 'rgba(99, 101, 241, 0.2)',
    transform: [{ rotate: '15deg' }],
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 10,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    padding: 4,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
});

export default Header;