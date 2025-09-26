// components/profile/useImageUpload.js
import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export const useImageUpload = (user, profile, onUploadSuccess) => {
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile picture.');
        return;
      }

      Alert.alert(
        'Select Image',
        'Choose how you want to select your profile picture',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: () => pickImage('camera') },
          { text: 'Gallery', onPress: () => pickImage('gallery') }
        ]
      );
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const pickImage = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Reduced quality for better network performance
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Reduced quality for better network performance
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      // Create a unique filename
      const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
      
      // Create FormData for multipart upload (better for network reliability)
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: fileName,
      });

      // Try different upload approach for better reliability
      let uploadData;
      let uploadError;

      try {
        // Method 1: Direct blob upload
        const response = await fetch(uri);
        const blob = await response.blob();

        const uploadResult = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: '3600' // Cache for 1 hour
          });

        uploadData = uploadResult.data;
        uploadError = uploadResult.error;
      } catch (blobError) {
        console.log('Blob upload failed, trying alternative method:', blobError);
        
        // Method 2: Base64 upload as fallback
        try {
          const base64Response = await fetch(uri);
          const buffer = await base64Response.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);

          const uploadResult = await supabase.storage
            .from('avatars')
            .upload(fileName, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true
            });

          uploadData = uploadResult.data;
          uploadError = uploadResult.error;
        } catch (base64Error) {
          throw new Error('Both upload methods failed');
        }
      }

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName, {
          transform: {
            width: 200,
            height: 200,
            quality: 80
          }
        });

      // Add cache busting parameter
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: cacheBustedUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess({ ...profile, avatar_url: cacheBustedUrl });
      }

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to update profile picture. ';
      if (error.message?.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('storage')) {
        errorMessage += 'Storage service is temporarily unavailable.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    handleImagePicker,
    uploading
  };
};