import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonalityAvatar, useAvatarUpload } from '@/lib/avatar';
import { Upload, Trash2, User, Loader2 } from 'lucide-react';
import type { Personality } from '@/lib/api';

interface AvatarUploadProps {
  personality: Personality;
  onAvatarChange?: () => void;
}

export default function AvatarUpload({ personality, onAvatarChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { avatarUrl, loading: avatarLoading } = usePersonalityAvatar(personality.personality_id);
  const { uploadAvatar, deleteAvatar, uploading } = useAvatarUpload();

  const getPersonalityInitials = (personality: Personality) => {
    return `${personality.first_name[0]}${personality.last_name[0]}`;
  };

  const handleFileSelect = async (file: File) => {
    setMessage(null);
    
    const result = await uploadAvatar(personality.personality_id, file);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Avatar erfolgreich hochgeladen!' });
      onAvatarChange?.();
      // Trigger a re-check of the avatar
      window.location.reload(); // Simple solution, could be optimized
    } else {
      setMessage({ type: 'error', text: result.error || 'Upload fehlgeschlagen' });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Möchten Sie das Avatar-Bild wirklich löschen?')) {
      return;
    }

    setMessage(null);
    const result = await deleteAvatar(personality.personality_id);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Avatar erfolgreich gelöscht!' });
      onAvatarChange?.();
      window.location.reload(); // Simple solution
    } else {
      setMessage({ type: 'error', text: result.error || 'Löschen fehlgeschlagen' });
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Avatar verwalten</span>
        </CardTitle>
        <CardDescription>
          Profilbild für {personality.first_name} {personality.last_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            {!avatarLoading && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${personality.first_name} ${personality.last_name}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            <div className={`w-32 h-32 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg ${avatarUrl && !avatarLoading ? 'hidden' : ''}`}>
              {avatarLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                getPersonalityInitials(personality)
              )}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-chinese_violet-400 bg-chinese_violet-50' 
              : 'border-gunmetal-300 hover:border-chinese_violet-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 text-gunmetal-400 mx-auto mb-4" />
          <p className="text-gunmetal-600 mb-2">
            Ziehen Sie ein Bild hierher oder klicken Sie zum Auswählen
          </p>
          <p className="text-sm text-gunmetal-500 mb-4">
            Unterstützte Formate: JPG, PNG, WebP (max. 5MB)
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Bild auswählen
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Actions */}
        {avatarUrl && (
          <div className="flex justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAvatar}
              disabled={uploading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Avatar löschen
            </Button>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
            {message.type === 'error' && message.text.includes('Bucket not found') && (
              <div className="mt-2 pt-2 border-t border-red-300">
                <p className="text-xs">
                  💡 <strong>Tipp:</strong> Verwenden Sie den "Storage Setup" Button in der Avatar-Verwaltung, 
                  um den benötigten Storage-Bucket automatisch zu erstellen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gunmetal-500 space-y-1">
          <p>• Das Bild wird automatisch auf 512x512 Pixel skaliert</p>
          <p>• Wird als WebP-Format gespeichert für optimale Performance</p>
          <p>• Speicherort: personalities/{personality.personality_id}/avatar.webp</p>
        </div>
      </CardContent>
    </Card>
  );
} 