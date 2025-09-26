import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import ReactNative from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

// Memoized DrawerItem component
const DrawerItem = React.memo(({ icon, label, onPress, color = "#111827", disabled = false }) => (
  <TouchableOpacity 
    style={[styles.navCard, disabled && styles.disabledCard]} 
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Ionicons name={icon} size={20} color={disabled ? "#9ca3af" : color} style={styles.icon} />
    <Text style={[styles.navText, { color: disabled ? "#9ca3af" : color }]}>
      {label}
    </Text>
  </TouchableOpacity>
));

export default function CustomDrawer() {
  const router = useRouter();
  const { user } = useAuth(); // user is guaranteed to exist due to layout protection
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { colors } = React.useContext(ThemeContext);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel(`profile-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated via real-time:', payload.new);
            setUserProfile(payload.new);
          }
        )
        .subscribe();

      // Cleanup subscription
      return () => {
        console.log('Cleaning up profile subscription');
        supabase.removeChannel(subscription);
      };
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || loading) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        console.log('No profile found, creating one...');
        await createUserProfile();
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id

  const setupRealtimeSubscription = () => {
    if (!user?.id) return;

    // Subscribe to real-time changes for this user's profile
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload.new);
          setUserProfile(payload.new);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const createUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profileData = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        username: user.user_metadata?.username || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      setUserProfile(data);
      console.log('Profile created successfully');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleNavigation = useCallback((route) => {
    try {
      router.push(route);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate. Please try again.');
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try {
            setLoading(true);
            
            // Clear any local state first
            setUserProfile(null);
            
            // Sign out from Supabase - this should trigger the auth state change in layout
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            console.log('✅ Logout successful - layout should handle redirect');
            // Let the layout handle the redirect automatically
            // The layout will detect user becomes null and show (auth) screen
            
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      },
    ]
  );
}, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => confirmDeleteAccount() 
        },
      ]
    );
  }, []);

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(
      "Final Confirmation",
      "Are you absolutely sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              
              // Delete user profile data
              const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

              if (profileError) {
                Alert.alert(profileError);
              }

              // Sign out the user (since we can't delete account from client)
              await supabase.auth.signOut();
              
              Alert.alert(
                'Account Data Cleared', 
                'Your profile data has been removed. Contact support for complete account deletion.'
              );
              // No need to navigate - layout will handle redirect automatically
              
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  }, [user]);

  // Memoized display values
  const displayInfo = useMemo(() => {
    const displayName = userProfile?.full_name || userProfile?.username || user?.email?.split('@')[0] || 'User';
    const displayEmail = user?.email || 'No email';
    const avatarUri = userProfile?.avatar_url || user?.user_metadata?.avatar_url;
    
    return { displayName, displayEmail, avatarUri };
  }, [userProfile, user]);

  // Show loading state while fetching profile
  if (loading && !userProfile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Profile Card */}
        <TouchableOpacity 
          style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => handleNavigation('/profile')}
          disabled={loading}
          activeOpacity={0.7}
        >
          {displayInfo.avatarUri ? (
            <Image 
              source={{ uri: displayInfo.avatarUri }} 
              style={styles.avatar}
              key={displayInfo.avatarUri}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}> 
              <Text style={styles.avatarText}>
                {displayInfo.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {displayInfo.displayName}
            </Text>
            <Text style={[styles.email, { color: colors.muted }]} numberOfLines={1}>
              {displayInfo.displayEmail}
            </Text>
          </View>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </TouchableOpacity>

        {/* Navigation Items */}
        <View style={styles.navigationSection}>
          <DrawerItem 
            icon="home-outline" 
            label="Home" 
            onPress={() => handleNavigation('/home')}
            disabled={loading}
          />
          <DrawerItem 
            icon="person-outline" 
            label="Profile" 
            onPress={() => handleNavigation('/profile')}
            disabled={loading}
          />
          <DrawerItem 
            icon="settings-outline" 
            label="Settings" 
            onPress={() => handleNavigation('/settings')}
            disabled={loading}
          />
          <DrawerItem 
            icon="help-circle-outline" 
            label="Help & Support" 
            onPress={() => handleNavigation('/support')}
            disabled={loading}
          />
        </View>
        
        {/* Danger actions moved to Settings */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '50%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  navigationSection: {
    marginBottom: 20,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: '#f3f4f6',
  },
  icon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerZone: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});