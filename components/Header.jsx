// components/Header/Header.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const Header = ({
  onNotificationPress,
  notificationCount = 0,
  navigation,
  showBackButton = false,
  onBackPress,
  title = null,
}) => {
  const [userName, setUserName] = useState('Guest');
  const [greeting, setGreeting] = useState('Good Morning');
  const { day, month } = getFormattedDate();
  const { colors } = React.useContext(ThemeContext);

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
      // Silently handle error
    }
  };

  const updateGreeting = () => {
  const hour = new Date().getHours();
  let newGreeting = '';

  if (hour >= 4 && hour < 12) {
    newGreeting = 'Good Morning 🌄';
  } else if (hour >= 12 && hour < 17) {
    newGreeting = 'Good Afternoon ☀️';
  } else if (hour >= 17 && hour < 21) {
    newGreeting = 'Good Evening 🌙';
  } else {
    newGreeting = 'Good Night 🌃';
  }

  setGreeting(newGreeting);
};


  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Background shapes */}
      <View style={styles.circleShape} />
      <View style={styles.rectangleShape} />
      
      <View style={styles.headerContent}>
        {showBackButton ? (
          <BackButtonSection
            title={title}
            onBackPress={onBackPress}
            colors={colors}
          />
        ) : (
          <LeftSection
            greeting={greeting}
            userName={userName}
            onMenuPress={() => navigation?.openDrawer?.()}
            colors={colors}
          />
        )}
        <RightSection
          day={day}
          month={month}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
          colors={colors}
        />
      </View>
    </View>
  );
};

const LeftSection = ({ greeting, userName, onMenuPress, colors }) => (
  <View style={styles.headerLeft}>
    <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
      <Ionicons name="menu-outline" size={24} color={colors.muted} />
    </TouchableOpacity>
    <View style={styles.textContainer}>
      <Text style={[styles.greeting, { color: colors.muted }]}>{greeting}</Text>
      <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
    </View>
  </View>
);

const BackButtonSection = ({ title, onBackPress, colors }) => (
  <View style={styles.headerLeft}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>
    <View style={styles.textContainer}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
    </View>
  </View>
);

const RightSection = ({ day, month, onNotificationPress, notificationCount, colors }) => (
  <View style={styles.headerRight}>
    <View style={[styles.dateContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.dateNumber, { color: colors.text }]}>{day}</Text>
      <Text style={[styles.dateMonth, { color: colors.muted }]}>{month}</Text>
    </View>
    <TouchableOpacity
      style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onNotificationPress}
      accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
    >
      <Ionicons name="notifications-outline" size={24} color={colors.muted} />
      {notificationCount > 0 && <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]} />}
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
    paddingVertical: 40,
    borderBottomWidth: 1,
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
  backButton: {
    padding: 4,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default Header;