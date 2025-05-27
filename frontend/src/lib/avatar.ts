import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { apiService, type PersonalityWithAvatar } from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Global cache for avatar information - loaded once from backend
let avatarCache = new Map<string, boolean>();
let cacheInitialized = false;
let cachePromise: Promise<void> | null = null;

// Utility function to get personality avatar URL from Supabase Storage
export const getPersonalityAvatarUrl = (personalityId: string): string => {
  if (!SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL not configured');
    return '';
  }
  
  return `${SUPABASE_URL}/storage/v1/object/public/personalities/${personalityId}/avatar.webp`;
};

// Initialize avatar cache from backend - much more efficient!
export const initializeAvatarCache = async (): Promise<void> => {
  if (cacheInitialized) return;
  
  // Prevent multiple simultaneous initializations
  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      console.log('Loading avatar information from backend...');
      
      const response = await apiService.getPersonalitiesWithAvatars();
      
      if (response.success && response.data) {
        // Clear existing cache
        avatarCache.clear();
        
        // Populate cache with backend data
        response.data.forEach((personality: PersonalityWithAvatar) => {
          avatarCache.set(personality.personality_id, personality.has_avatar);
        });
        
        console.log(`Avatar cache initialized with ${avatarCache.size} entries from backend`);
      } else {
        console.warn('Failed to load avatar information from backend:', response.error);
      }
      
      cacheInitialized = true;
    } catch (error) {
      console.error('Failed to initialize avatar cache:', error);
      cacheInitialized = true; // Mark as initialized to prevent retries
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
};

// Simple function to check if avatar exists (uses cache)
export const checkAvatarExists = (personalityId: string): boolean => {
  return avatarCache.get(personalityId) || false;
};

// Get all personalities with avatar status (from cache)
export const getAllPersonalitiesWithAvatars = (): PersonalityWithAvatar[] => {
  const result: PersonalityWithAvatar[] = [];
  
  avatarCache.forEach((hasAvatar, personalityId) => {
    result.push({
      personality_id: personalityId,
      first_name: '', // Will be filled by the component
      last_name: '',  // Will be filled by the component
      has_avatar: hasAvatar,
      shows: [], // Will be filled by the component
      latest_show: undefined // Will be filled by the component
    });
  });
  
  return result;
};

// React Hook to get avatar URL - now super fast!
export const usePersonalityAvatar = (personalityId: string) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personalityId) {
      setLoading(false);
      return;
    }

    const initAndCheck = async () => {
      // Initialize cache if not done yet (only happens once globally)
      await initializeAvatarCache();

      // Check cache for avatar (instant!)
      const hasAvatar = checkAvatarExists(personalityId);
      
      if (hasAvatar) {
        setAvatarUrl(getPersonalityAvatarUrl(personalityId));
      } else {
        setAvatarUrl(null);
      }
      
      setLoading(false);
    };

    initAndCheck();
  }, [personalityId]);

  return { avatarUrl, loading };
};

// Hook for uploading avatars
export const useAvatarUpload = () => {
  const supabase = useSupabaseClient();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (personalityId: string, file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Bitte wählen Sie eine Bilddatei aus.' };
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Die Datei ist zu groß. Maximale Größe: 5MB.' };
      }

      // Convert to WebP if needed
      const webpFile = await convertToWebP(file);

      // Upload to Supabase Storage
      const filePath = `${personalityId}/avatar.webp`;
      
      const { error: uploadError } = await supabase.storage
        .from('personalities')
        .upload(filePath, webpFile, {
          cacheControl: '3600',
          upsert: true // Overwrite existing file
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Check if it's a bucket not found error
        if (uploadError.message.includes('Bucket not found')) {
          return { 
            success: false, 
            error: 'Storage-Bucket "personalities" existiert nicht. Bitte kontaktieren Sie den Administrator.' 
          };
        }
        
        return { success: false, error: `Upload fehlgeschlagen: ${uploadError.message}` };
      }

      // Update cache
      avatarCache.set(personalityId, true);

      return { success: true };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.' };
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (personalityId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const filePath = `${personalityId}/avatar.webp`;
      
      const { error } = await supabase.storage
        .from('personalities')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: `Löschen fehlgeschlagen: ${error.message}` };
      }

      // Update cache
      avatarCache.set(personalityId, false);

      return { success: true };
    } catch (error) {
      console.error('Avatar delete error:', error);
      return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.' };
    }
  };

  return { uploadAvatar, deleteAvatar, uploading };
};

// Helper function to convert image to WebP
const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size (max 512x512 for avatars)
      const maxSize = 512;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File([blob], 'avatar.webp', {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        0.8 // Quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};