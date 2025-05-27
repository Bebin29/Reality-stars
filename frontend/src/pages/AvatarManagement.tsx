import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiService, type Personality, type PersonalityWithAvatar } from '@/lib/api';
import { usePersonalityAvatar, initializeAvatarCache } from '@/lib/avatar';
import AvatarUpload from '@/components/AvatarUpload';
import StorageSetup from '@/components/StorageSetup';
import { ArrowLeft, Search, Users, Image, Loader2, AlertTriangle } from 'lucide-react';

export default function AvatarManagement() {
  const [personalities, setPersonalities] = useState<PersonalityWithAvatar[]>([]);
  const [filteredPersonalities, setFilteredPersonalities] = useState<PersonalityWithAvatar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [filter, setFilter] = useState<'all' | 'with-avatar' | 'without-avatar'>('all');
  const [showStorageSetup, setShowStorageSetup] = useState(false);

  const loadPersonalities = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load avatar information from backend (super efficient!)
      const avatarResponse = await apiService.getPersonalitiesWithAvatars();
      
      if (avatarResponse.success && avatarResponse.data) {
        // Initialize the avatar cache with backend data
        await initializeAvatarCache();
        
        setPersonalities(avatarResponse.data);
        setFilteredPersonalities(avatarResponse.data);
      }
    } catch (error) {
      console.error('Error loading personalities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonalities();
  }, [loadPersonalities]);

  // Filter personalities based on search and avatar status
  useEffect(() => {
    let filtered = personalities;

    // Search filter - now includes show names
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.first_name.toLowerCase().includes(searchLower) ||
        p.last_name.toLowerCase().includes(searchLower) ||
        (p.shows && p.shows.some(show => show.toLowerCase().includes(searchLower))) ||
        (p.latest_show && p.latest_show.toLowerCase().includes(searchLower))
      );
    }

    // Avatar filter
    if (filter === 'with-avatar') {
      filtered = filtered.filter(p => p.has_avatar);
    } else if (filter === 'without-avatar') {
      filtered = filtered.filter(p => !p.has_avatar);
    }

    setFilteredPersonalities(filtered);
  }, [personalities, searchTerm, filter]);

  const getPersonalityInitials = (personality: PersonalityWithAvatar) => {
    return `${personality.first_name[0] || '?'}${personality.last_name[0] || '?'}`;
  };

  const handleAvatarChange = () => {
    // Reload personalities to update avatar status
    loadPersonalities();
    setSelectedPersonality(null);
  };

  // Simple personality card - now with backend data
  const PersonalityCard = ({ personality }: { personality: PersonalityWithAvatar }) => {
    const { avatarUrl } = usePersonalityAvatar(personality.personality_id);

    return (
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => {
              // Convert PersonalityWithAvatar to Personality for the upload component
              const fullPersonality: Personality = {
                personality_id: personality.personality_id,
                first_name: personality.first_name,
                last_name: personality.last_name,
                // Add default values for required fields
                birth_date: undefined,
                birth_place: undefined,
                nationality: undefined,
                gender: undefined,
                bio: undefined,
                profile_image: undefined,
                created_at: undefined,
                updated_at: undefined
              };
              setSelectedPersonality(fullPersonality);
            }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Avatar Preview */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${personality.first_name} ${personality.last_name}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-gunmetal-300 to-gunmetal-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getPersonalityInitials(personality)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-gunmetal-800">
                {personality.first_name} {personality.last_name}
              </h3>
              
              {/* Show Information */}
              {personality.latest_show && (
                <p className="text-sm text-chinese_violet-600 font-medium">
                  {personality.latest_show}
                </p>
              )}
              
              {/* Additional Shows */}
              {personality.shows && personality.shows.length > 1 && (
                <p className="text-xs text-gunmetal-500">
                  +{personality.shows.length - 1} weitere Show{personality.shows.length - 1 !== 1 ? 's' : ''}
                </p>
              )}
              
              {/* No Shows */}
              {(!personality.shows || personality.shows.length === 0) && (
                <p className="text-sm text-gunmetal-500 italic">
                  Keine Shows zugeordnet
                </p>
              )}
              
              <p className="text-xs text-gunmetal-400 mt-1">
                ID: {personality.personality_id.slice(0, 8)}...
              </p>
              
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${personality.has_avatar ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gunmetal-500">
                  {personality.has_avatar ? 'Avatar vorhanden' : 'Kein Avatar'}
                </span>
              </div>
            </div>

            {/* Action Indicator */}
            <div className="flex-shrink-0">
              <Image className="h-5 w-5 text-gunmetal-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selectedPersonality) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPersonality(null)}
                  className="text-gunmetal-600 hover:text-gunmetal-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Übersicht
                </Button>
                <div className="h-6 w-px bg-gunmetal-300"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
                  Avatar verwalten
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AvatarUpload 
            personality={selectedPersonality} 
            onAvatarChange={handleAvatarChange}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gunmetal-600 hover:text-gunmetal-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gunmetal-300"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
                Avatar-Verwaltung
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStorageSetup(!showStorageSetup)}
                className="text-gunmetal-600 hover:text-gunmetal-800"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Storage Setup
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storage Setup Section */}
        {showStorageSetup && (
          <div className="mb-6">
            <StorageSetup />
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gunmetal-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Suche nach Namen oder Shows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 rounded-md border border-gunmetal-300 bg-white text-gunmetal-700 focus:border-chinese_violet-500 focus:outline-none focus:ring-1 focus:ring-chinese_violet-500"
            >
              <option value="all">Alle anzeigen</option>
              <option value="with-avatar">Mit Avatar</option>
              <option value="without-avatar">Ohne Avatar</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gunmetal-600">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{filteredPersonalities.length} Persönlichkeit{filteredPersonalities.length !== 1 ? 'en' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{personalities.filter(p => p.has_avatar).length} mit Avatar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{personalities.filter(p => !p.has_avatar).length} ohne Avatar</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-chinese_violet-500 border-t-transparent"></div>
          </div>
        )}

        {/* Personalities Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonalities.map((personality) => (
              <PersonalityCard 
                key={personality.personality_id} 
                personality={personality} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPersonalities.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-gunmetal-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gunmetal-800 mb-2">
              Keine Persönlichkeiten gefunden
            </h3>
            <p className="text-gunmetal-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe.' : 'Keine Persönlichkeiten verfügbar.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 