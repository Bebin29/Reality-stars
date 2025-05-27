import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService, type Personality } from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Globe, 
  User, 
  Trophy, 
  AlertTriangle, 
  Tv, 
  Camera, 
  ExternalLink as ExternalLinkIcon,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Edit,
  Share
} from 'lucide-react';

export default function PersonalityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Keine Persönlichkeits-ID angegeben');
      setLoading(false);
      return;
    }

    loadPersonality();
  }, [id]);

  const loadPersonality = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPersonalityById(id!);
      
      if (response.success && response.data) {
        setPersonality(response.data);
      } else {
        setError(response.error || 'Persönlichkeit nicht gefunden');
      }
    } catch (error) {
      console.error('Error loading personality:', error);
      setError('Fehler beim Laden der Persönlichkeit');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSocialMediaIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('instagram')) return <Instagram className="h-4 w-4" />;
    if (name.includes('twitter') || name.includes('x')) return <Twitter className="h-4 w-4" />;
    if (name.includes('facebook')) return <Facebook className="h-4 w-4" />;
    if (name.includes('youtube')) return <Youtube className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getPersonalityInitials = (personality: Personality) => {
    return `${personality.first_name[0]}${personality.last_name[0]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-chinese_violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !personality) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Fehler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gunmetal-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/personalities')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </CardContent>
        </Card>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/personalities')}
                className="text-gunmetal-600 hover:text-gunmetal-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <div className="h-6 w-px bg-gunmetal-300"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
                {personality.first_name} {personality.last_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Teilen
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {personality.profile_image ? (
                    <img
                      src={personality.profile_image}
                      alt={`${personality.first_name} ${personality.last_name}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                      {getPersonalityInitials(personality)}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gunmetal-800 mb-2">
                    {personality.first_name} {personality.last_name}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {personality.gender && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span className="capitalize">{personality.gender}</span>
                      </Badge>
                    )}
                    
                    {personality.nationality && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{personality.nationality}</span>
                      </Badge>
                    )}
                    
                    {personality.birth_date && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getAge(personality.birth_date)} Jahre</span>
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gunmetal-600">
                    {personality.birth_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Geboren: {formatDate(personality.birth_date)}</span>
                      </div>
                    )}
                    
                    {personality.birth_place && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Geburtsort: {personality.birth_place}</span>
                      </div>
                    )}
                  </div>

                  {personality.bio && (
                    <div className="mt-4">
                      <p className="text-gunmetal-700 leading-relaxed">{personality.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/90 backdrop-blur-md">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="appearances">Auftritte</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="awards">Auszeichnungen</TabsTrigger>
            <TabsTrigger value="controversies">Kontroversen</TabsTrigger>
            <TabsTrigger value="media">Medien</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appearances */}
              <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tv className="h-5 w-5" />
                    <span>Aktuelle Auftritte</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {personality.appearance && personality.appearance.length > 0 ? (
                    <div className="space-y-3">
                      {personality.appearance.slice(0, 3).map((appearance) => (
                        <div key={appearance.appearance_id} className="flex items-center justify-between p-3 bg-gunmetal-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gunmetal-800">{appearance.tv_show.title}</p>
                            {appearance.role && (
                              <p className="text-sm text-gunmetal-600">{appearance.role}</p>
                            )}
                          </div>
                          {appearance.appearance_date && (
                            <Badge variant="outline">
                              {formatDate(appearance.appearance_date)}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {personality.appearance.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full">
                          Alle {personality.appearance.length} Auftritte anzeigen
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gunmetal-500 text-center py-4">Keine Auftritte verzeichnet</p>
                  )}
                </CardContent>
              </Card>

              {/* External Links */}
              <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ExternalLinkIcon className="h-5 w-5" />
                    <span>Externe Links</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {personality.external_link && personality.external_link.length > 0 ? (
                    <div className="space-y-2">
                      {personality.external_link.map((link) => (
                        <a
                          key={link.link_id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gunmetal-50 rounded-lg hover:bg-gunmetal-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <ExternalLinkIcon className="h-4 w-4 text-gunmetal-500" />
                            <span className="font-medium text-gunmetal-800 capitalize">{link.type}</span>
                          </div>
                          <ExternalLinkIcon className="h-3 w-3 text-gunmetal-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gunmetal-500 text-center py-4">Keine externen Links verfügbar</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearances Tab */}
          <TabsContent value="appearances">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tv className="h-5 w-5" />
                  <span>Alle Auftritte</span>
                </CardTitle>
                <CardDescription>
                  Chronologische Übersicht aller TV- und Web-Auftritte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personality.appearance && personality.appearance.length > 0 ? (
                  <div className="space-y-4">
                    {personality.appearance
                      .sort((a, b) => new Date(b.appearance_date || '').getTime() - new Date(a.appearance_date || '').getTime())
                      .map((appearance) => (
                      <div key={appearance.appearance_id} className="border border-gunmetal-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gunmetal-800">{appearance.tv_show.title}</h3>
                          {appearance.appearance_date && (
                            <Badge variant="outline">
                              {formatDate(appearance.appearance_date)}
                            </Badge>
                          )}
                        </div>
                        
                        {appearance.role && (
                          <p className="text-sm text-gunmetal-600 mb-2">
                            <strong>Rolle:</strong> {appearance.role}
                          </p>
                        )}
                        
                        {appearance.episode && (
                          <p className="text-sm text-gunmetal-600 mb-2">
                            <strong>Episode:</strong> {appearance.episode.title || `Episode ${appearance.episode.episode_number}`}
                          </p>
                        )}
                        
                        {appearance.notes && (
                          <p className="text-sm text-gunmetal-600 italic">{appearance.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gunmetal-500 text-center py-8">Keine Auftritte verzeichnet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Social Media Accounts</span>
                </CardTitle>
                <CardDescription>
                  Verknüpfte Social Media Profile und Accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personality.social_media_account && personality.social_media_account.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personality.social_media_account.map((account) => (
                      <a
                        key={account.account_id}
                        href={account.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-4 p-4 border border-gunmetal-200 rounded-lg hover:bg-gunmetal-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {getSocialMediaIcon(account.social_media_platform.name)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gunmetal-800">
                            {account.social_media_platform.name}
                          </p>
                          <p className="text-sm text-gunmetal-600">@{account.handle}</p>
                        </div>
                        <ExternalLinkIcon className="h-4 w-4 text-gunmetal-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gunmetal-500 text-center py-8">Keine Social Media Accounts verknüpft</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Auszeichnungen & Preise</span>
                </CardTitle>
                <CardDescription>
                  Erhaltene Auszeichnungen und Nominierungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personality.award && personality.award.length > 0 ? (
                  <div className="space-y-4">
                    {personality.award
                      .sort((a, b) => b.year - a.year)
                      .map((award) => (
                      <div key={award.award_id} className="border border-gunmetal-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gunmetal-800">{award.award_name}</h3>
                          <Badge variant="outline">{award.year}</Badge>
                        </div>
                        
                        {award.category && (
                          <p className="text-sm text-gunmetal-600 mb-1">
                            <strong>Kategorie:</strong> {award.category}
                          </p>
                        )}
                        
                        {award.organization && (
                          <p className="text-sm text-gunmetal-600">
                            <strong>Organisation:</strong> {award.organization}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gunmetal-500 text-center py-8">Keine Auszeichnungen verzeichnet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controversies Tab */}
          <TabsContent value="controversies">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Kontroversen & Skandale</span>
                </CardTitle>
                <CardDescription>
                  Dokumentierte Kontroversen und öffentliche Diskussionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personality.controversy && personality.controversy.length > 0 ? (
                  <div className="space-y-4">
                    {personality.controversy
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((controversy) => (
                      <div key={controversy.controversy_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-red-800">{controversy.title}</h3>
                          <Badge variant="destructive">{formatDate(controversy.date)}</Badge>
                        </div>
                        
                        <p className="text-sm text-red-700 mb-3">{controversy.description}</p>
                        
                        {controversy.source_url && (
                          <a
                            href={controversy.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
                          >
                            <ExternalLinkIcon className="h-3 w-3" />
                            <span>Quelle</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gunmetal-500 text-center py-8">Keine Kontroversen dokumentiert</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Medien</span>
                </CardTitle>
                <CardDescription>
                  Fotos, Videos und andere Medieninhalte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personality.media && personality.media.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personality.media
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((media) => (
                      <div key={media.media_id} className="border border-gunmetal-200 rounded-lg overflow-hidden">
                        {media.type === 'photo' ? (
                          <img
                            src={media.url}
                            alt={media.caption || 'Media'}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gunmetal-100 flex items-center justify-center">
                            <Camera className="h-12 w-12 text-gunmetal-400" />
                          </div>
                        )}
                        
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="capitalize">
                              {media.type}
                            </Badge>
                            <span className="text-xs text-gunmetal-500">
                              {formatDate(media.created_at)}
                            </span>
                          </div>
                          
                          {media.caption && (
                            <p className="text-sm text-gunmetal-600">{media.caption}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gunmetal-500 text-center py-8">Keine Medieninhalte verfügbar</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 