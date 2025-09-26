import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../lib/supabase';

export class ImageService {
  static async validateImage(uri) {
    try {
      if (!uri) throw new Error('No image URI provided');
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileInfo.size > maxSize) {
        throw new Error('Image is too large. Please select an image smaller than 5MB.');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Image validation failed: ${error.message}`);
    }
  }

  static async prepareImageData(uri) {
    if (Platform.OS === 'web') {
      // For web, fetch as blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }
      return await response.blob();
    } else {
      // For mobile, read file as base64 and convert
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
  }

  static async uploadToSupabase(fileName, fileData, options = {}) {
    const defaultOptions = {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '3600'
    };

    const uploadOptions = { ...defaultOptions, ...options };

    // Upload with retry logic
    let retries = 3;
    let uploadData, uploadError;

    while (retries > 0) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, uploadOptions);
      
      uploadData = data;
      uploadError = error;
      
      if (!uploadError) break;
      
      retries--;
      if (retries > 0) {
        console.warn(`Upload attempt failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (uploadError) {
      throw new Error(`Upload failed after multiple attempts: ${uploadError.message}`);
    }

    return uploadData;
  }

  static async deleteOldAvatar(avatarUrl) {
    if (!avatarUrl) return;

    try {
      const oldPath = avatarUrl.split('/').pop();
      if (oldPath && oldPath.startsWith('avatar-')) {
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);
      }
    } catch (error) {
      console.warn('Failed to delete old avatar:', error);
      // Don't throw - this is not critical
    }
  }

  static getPublicUrl(fileName) {
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    return publicUrl;
  }
}

// ============================================================================
// File: components/profile/services/profileService.js
import { supabase } from '../../../lib/supabase';

export class ProfileService {
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    return user;
  }

  static async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Profile fetch error: ${error.message}`);
    }

    return data;
  }

  static async updateProfile(userId, updateData) {
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  static async updateUserEmail(newEmail) {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      throw new Error(`Email update failed: ${error.message}`);
    }
  }

  static validateField(field, value) {
    switch (field) {
      case 'username':
        if (value && !value.match(/^[a-zA-Z0-9_]+$/)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        break;
      case 'email':
        if (value && !value.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        break;
      case 'phone':
        if (value && !value.match(/^[\+]?[0-9\-\(\)\s]+$/)) {
          throw new Error('Please enter a valid phone number');
        }
        break;
    }
  }
}
