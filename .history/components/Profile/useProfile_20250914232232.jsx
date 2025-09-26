// components/profile/useProfile.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModal, setEditModal] = useState({
    visible: false,
    field: null,
    value: '',
    title: '',
    placeholder: '',
    multiline: false,
    keyboardType: 'default'
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        Alert.alert('Authentication Error', 'Please sign in to continue');
        return;
      }

      setUser(authUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (field, currentValue, title, placeholder, multiline = false, keyboardType = 'default') => {
    setEditModal({
      visible: true,
      field,
      value: currentValue,
      title,
      placeholder,
      multiline,
      keyboardType
    });
  };

  const closeEditModal = () => {
    setEditModal({
      visible: false,
      field: null,
      value: '',
      title: '',
      placeholder: '',
      multiline: false,
      keyboardType: 'default'
    });
  };

  const handleSaveField = async (field, value, showAlert = true) => {
    if (!user) return;

    try {
      setUpdating(true);

      if (field === 'email') {
        // Update email in auth
        const { error: emailError } = await supabase.auth.updateUser({
          email: value
        });
        if (emailError) throw emailError;
        
        // Update local user state
        setUser(prev => ({ ...prev, email: value }));
      } else if (field === 'avatar_url') {
        // Direct profile update for avatar (called from image upload hook)
        setProfile(prev => ({ ...prev, avatar_url: value }));
        return;
      } else {
        // Update profile fields
        const updateData = { [field]: value || null };
        
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;

        // Update local profile state
        setProfile(prev => ({ ...prev, [field]: value }));
      }

      if (showAlert) {
        Alert.alert('Success', `${field.replace('_', ' ')} updated successfully`);
      }
    } catch (error) {
      console.error('Update error:', error);
      if (showAlert) {
        Alert.alert('Error', `Failed to update ${field.replace('_', ' ')}. Please try again.`);
      }
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    user,
    profile,
    loading,
    updating,
    editModal,
    openEditModal,
    closeEditModal,
    handleSaveField,
    setProfile // Expose for external updates like image upload
  };
};