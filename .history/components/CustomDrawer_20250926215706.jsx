import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Clean header */}
        <View style={styles.simpleHeader}>
          <Text style={styles.appTitle}>
            <Text style={styles.appTitleFirst}>Action</Text>
            <Text style={styles.appTitleSecond}>able</Text>
          </Text>
          <Text style={styles.appSubtitle}>Quick navigation</Text>
        </View>

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
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => handleNavigation('/notifications')}
            disabled={loading}
          />
          <DrawerItem 
            icon="shield-checkmark-outline" 
            label="Privacy & Security" 
            onPress={() => handleNavigation('/privacy')}
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
        
        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <DrawerItem 
            icon="trash-outline" 
            label="Delete Account" 
            onPress={handleDeleteAccount}
            color="#ef4444"
            disabled={loading}
          />
          <DrawerItem 
            icon="log-out-outline" 
            label="Logout" 
            onPress={handleLogout}
            color="#ef4444"
            disabled={loading}
          />
        </View>
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
  simpleHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appTitleFirst: {
    color: '#06b6d4',
  },
  appTitleSecond: {
    color: '#0891b2',
  },
  appSubtitle: {
    marginTop: 4,
    color: '#64748b',
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