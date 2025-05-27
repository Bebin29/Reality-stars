import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonalityAvatar } from '@/lib/avatar';
import { Loader2 } from 'lucide-react';
import type { Personality } from '@/lib/api';

interface PersonalityCardProps {
  personality: Personality;
  showBio?: boolean;
  className?: string;
}

export default function PersonalityCard({ personality, showBio = true, className = "" }: PersonalityCardProps) {
  const { avatarUrl, loading: avatarLoading } = usePersonalityAvatar(personality.personality_id);

  const getPersonalityInitials = (personality: Personality) => {
    return `${personality.first_name[0]}${personality.last_name[0]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Link
      to={`/personality/${personality.personality_id}`}
      className={`group ${className}`}
    >
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <CardHeader className="text-center pb-4">
          {/* Avatar */}
          <div className="mx-auto mb-3">
            {avatarLoading ? (
              <div className="w-16 h-16 bg-gunmetal-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gunmetal-400" />
              </div>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${personality.first_name} ${personality.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            <div className={`w-16 h-16 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarUrl && !avatarLoading ? 'hidden' : ''}`}>
              {getPersonalityInitials(personality)}
            </div>
          </div>

          <CardTitle className="text-lg text-gunmetal-800 group-hover:text-chinese_violet-600 transition-colors">
            {personality.first_name} {personality.last_name}
          </CardTitle>
          <CardDescription className="text-gunmetal-600">
            {personality.nationality || 'Unbekannte Nationalität'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-gunmetal-600">
            {personality.gender && (
              <div className="flex justify-between">
                <span>Geschlecht:</span>
                <span className="capitalize">{personality.gender}</span>
              </div>
            )}
            {personality.birth_date && (
              <div className="flex justify-between">
                <span>Geboren:</span>
                <span>{formatDate(personality.birth_date)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Hinzugefügt:</span>
              <span>{formatDate(personality.created_at)}</span>
            </div>
          </div>
          
          {showBio && personality.bio && (
            <div className="mt-3 pt-3 border-t border-gunmetal-200">
              <p className="text-sm text-gunmetal-600 line-clamp-2">
                {personality.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 